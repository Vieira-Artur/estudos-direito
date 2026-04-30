#!/usr/bin/env python3
"""
Coleta semanal dos Informativos de Jurisprudencia do STJ
filtrando enunciados cujo "RAMO DO DIREITO" contenha "Processual Penal".

Gera um fragmento HTML por edicao + atualiza um indice cronologico.
Mantem um estado em _state.json para nao reprocessar edicoes ja gravadas.

Uso:
    python scripts/informativos_stj.py            # processa edicoes novas
    python scripts/informativos_stj.py --from 886 # forca inicio em N
    python scripts/informativos_stj.py --dry-run  # nao escreve arquivos
"""
from __future__ import annotations

import argparse
import datetime as dt
import json
import logging
import os
import re
import sys
import subprocess
import time
from html import escape as h
from pathlib import Path
from typing import Optional
from urllib.parse import quote, urljoin

import requests
from bs4 import BeautifulSoup, Tag

# --------------------------------------------------------------------- config

REPO_ROOT       = Path(__file__).resolve().parent.parent
TARGET_DIR      = REPO_ROOT / "conteudo" / "processual-penal-informativos-stj"
STATE_FILE      = TARGET_DIR / "_state.json"
INDEX_FILE      = TARGET_DIR / "index.html"

STJ_BASE        = "https://scon.stj.jus.br/jurisprudencia/externo/informativo/"
PROCESSO_BASE   = "https://processo.stj.jus.br/jurisprudencia/externo/informativo/"
# processo.stj.jus.br?from=feed retorna HTML estático (sem JS) e não bloqueia IPs de CI.
# As aspas (%27) em volta do número são obrigatórias para retornar a edição completa.
EDITION_URL_TPL = PROCESSO_BASE + "?acao=pesquisarumaedicao&livre=%27{n:04d}%27.cod.&from=feed"
LISTING_URL     = STJ_BASE + "?acao=pesquisar"

USER_AGENT      = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")

# Sempre comeca a partir desta edicao no primeiro run
INITIAL_EDITION = 886

# Filtro de ramo do direito (case-insensitive). Inclusivo: aceita combinacoes
# como "Direito Penal e Processual Penal", "Direito Processual Penal Militar".
RAMO_REGEX = re.compile(r"processual\s+penal", re.IGNORECASE)

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(message)s",
    datefmt="%H:%M:%S",
)
log = logging.getLogger("informativos-stj")

# --------------------------------------------------------------------- HTTP

_session: Optional[requests.Session] = None


def session() -> requests.Session:
    global _session
    if _session is None:
        s = requests.Session()
        s.headers.update({
            "User-Agent": USER_AGENT,
            "Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8",
        })
        _session = s
    return _session


def fetch(url: str, *, retries: int = 3, sleep: float = 2.0) -> str:
    last_exc: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            r = session().get(url, timeout=30)
            r.raise_for_status()
            r.encoding = r.apparent_encoding or "utf-8"
            return r.text
        except Exception as exc:                       # noqa: BLE001
            last_exc = exc
            log.warning("Tentativa %d falhou em %s: %s", attempt, url, exc)
            if attempt < retries:
                time.sleep(sleep * attempt)
    raise RuntimeError(f"Falha ao buscar {url}: {last_exc}")

# --------------------------------------------------------------------- estado


def load_state() -> dict:
    if STATE_FILE.exists():
        return json.loads(STATE_FILE.read_text(encoding="utf-8"))
    return {
        "ultima_edicao_processada": INITIAL_EDITION - 1,
        "edicoes": {},   # "886" -> {"data": "2026-04-29", "qtd_enunciados": 5}
        "atualizado_em": None,
    }


def save_state(state: dict) -> None:
    state["atualizado_em"] = dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
    TARGET_DIR.mkdir(parents=True, exist_ok=True)
    STATE_FILE.write_text(json.dumps(state, ensure_ascii=False, indent=2),
                          encoding="utf-8")

# --------------------------------------------------------------------- parsing
#
# Estrutura observavel do informativo do STJ:
#   - cada enunciado tem rotulos "PROCESSO", "RAMO DO DIREITO", "TEMA",
#     "DESTAQUE" e "INFORMACOES DO INTEIRO TEOR".
#   - o numero do processo aparece como link (acao=pesquisar&livre=@CNOT...).
#   - o layout da pagina varia ligeiramente; este parser usa duas estrategias
#     em sequencia: (1) varredura por blocos com classe identificavel,
#     (2) fallback por rotulagem em texto puro.
# ----------------------------------------------------------------------------


def normalize(s: str) -> str:
    return re.sub(r"\s+", " ", s).strip()


def parse_enunciados(html: str) -> list[dict]:
    soup = BeautifulSoup(html, "html.parser")

    # estrategia 1: clsInformativoBlocoItem (processo.stj.jus.br?from=feed — layout atual)
    enunciados = parse_enunciados_cls(soup)
    if enunciados:
        return enunciados

    # estrategia 2: div.resultado (processo.stj.jus.br?from=feed — layout anterior)
    enunciados = parse_enunciados_resultado(soup)
    if enunciados:
        return enunciados

    # estrategia 2: CNOT anchors (scon.stj.jus.br quando acessível)
    enunciados = parse_enunciados_cnot(soup)
    if enunciados:
        return enunciados

    # estrategia 3: tags <strong> como rótulos genéricos
    enunciados = parse_enunciados_strong(soup)
    if enunciados:
        return enunciados

    # estrategia 4: parse linear por rótulos (fallback)
    return parse_enunciados_linear(soup)


def parse_enunciados_cls(soup: BeautifulSoup) -> list[dict]:
    """Estratégia primária: processo.stj.jus.br?from=feed — classes clsInformativoBlocoItem."""
    blocos = soup.find_all("div", class_="clsInformativoBlocoItem")
    if not blocos:
        return []

    label_keys = {k.upper(): v for k, v in LABELS.items()}
    out: list[dict] = []

    for bloco in blocos:
        entry: dict[str, str] = {"cnot": "", "link": ""}
        labels = [normalize(l.get_text()).rstrip(":").upper()
                  for l in bloco.find_all("div", class_="clsInformativoLabel")]
        textos = bloco.find_all("div", class_="clsInformativoTexto")

        texto_idx = 0
        for label in labels:
            chave = label_keys.get(label)
            if label == "DESTAQUE":
                for d in bloco.find_all("div", class_="clsDestaqueAzul"):
                    t = normalize(d.get_text())
                    if t.upper() != "DESTAQUE" and t:
                        entry["destaque"] = t
                        break
            elif chave and chave in ("processo", "ramo", "tema"):
                if texto_idx < len(textos):
                    entry[chave] = normalize(textos[texto_idx].get_text())
                    texto_idx += 1
            elif texto_idx < len(textos):
                texto_idx += 1

        for a in bloco.find_all("a", href=True):
            m = re.search(r"CNOT[^0-9]*(\d+)", a["href"], re.IGNORECASE)
            if m:
                cnot = m.group(1)
                entry["cnot"] = cnot
                entry["link"] = urljoin(STJ_BASE,
                    f"?aplicacao=informativo&acao=pesquisar&livre=@CNOT='{cnot}'")
                break

        if entry.get("ramo") and entry.get("destaque"):
            out.append(entry)

    return out


def parse_enunciados_resultado(soup: BeautifulSoup) -> list[dict]:
    """Estratégia primária: processo.stj.jus.br?from=feed.

    Estrutura observada:
      <div class="resultado">
        <a class="resultado-link" href="?livre=@CNOT=022275">
          <p class="resultado-ementa">Tema do julgado...</p>
        </a>
        <div class="resultado-detalhes">
          <p><strong>Processo:</strong> texto...</p>
          <p><strong>Ramo do Direito:</strong> DIREITO PROCESSUAL PENAL</p>
          <p><strong>Destaque:</strong> texto...</p>
        </div>
      </div>
    """
    divs = soup.find_all("div", class_="resultado")
    if not divs:
        return []

    label_keys = {k.upper(): v for k, v in LABELS.items()}
    out: list[dict] = []

    for div in divs:
        entry: dict[str, str] = {}

        # CNOT e link
        link_tag = div.find("a", class_="resultado-link")
        if link_tag:
            href = link_tag.get("href", "")
            m = re.search(r"CNOT[^0-9]*(\d+)", href, re.IGNORECASE)
            if m:
                cnot = m.group(1)
                entry["cnot"] = cnot
                entry["link"] = urljoin(STJ_BASE,
                    f"?aplicacao=informativo&acao=pesquisar&livre=@CNOT='{cnot}'")

        # TEMA — <p class="resultado-ementa">
        ementa = div.find("p", class_="resultado-ementa")
        if ementa:
            entry["tema"] = normalize(ementa.get_text(" ", strip=True))

        # Campos <strong>Label:</strong> valor  dentro de resultado-detalhes
        detalhes = div.find("div", class_="resultado-detalhes")
        if detalhes:
            for p_tag in detalhes.find_all("p"):
                strong = p_tag.find("strong")
                if not strong:
                    continue
                label_raw = normalize(strong.get_text()).rstrip(":").strip().upper()
                if label_raw not in label_keys:
                    continue
                chave = label_keys[label_raw]
                parts: list[str] = []
                for child in p_tag.children:
                    if child is strong:
                        continue
                    if hasattr(child, "get"):
                        href_val = child.get("href", "")
                        if href_val and "un.org" in href_val:
                            continue
                    if hasattr(child, "get_text"):
                        t = child.get_text(" ", strip=True)
                    elif isinstance(child, str):
                        t = child.strip()
                    else:
                        continue
                    if t:
                        parts.append(t)
                value = normalize(" ".join(parts))
                if value:
                    entry[chave] = value

        if "ramo" not in entry or "destaque" not in entry:
            continue
        if "processo" not in entry:
            entry["processo"] = entry.get("tema", "")
        entry.setdefault("cnot", "")
        entry.setdefault("link", "")
        out.append(entry)

    return out


def parse_enunciados_cnot(soup: BeautifulSoup) -> list[dict]:
    """Estratégia para scon.stj.jus.br renderizado: busca anchors com CNOT no href."""
    enunciados: list[dict] = []
    seen_cnots: set[str] = set()

    anchors = soup.find_all("a", href=re.compile(r"CNOT", re.I))
    for a in anchors:
        href = a.get("href") or ""
        m = re.search(r"CNOT[^0-9]*(\d+)", href, re.IGNORECASE)
        if not m:
            continue
        cnot = m.group(1)
        if cnot in seen_cnots:
            continue
        seen_cnots.add(cnot)

        bloco = a
        for _ in range(8):
            if bloco.parent is None:
                break
            bloco = bloco.parent
            txt = bloco.get_text(" ", strip=True).upper()
            if "RAMO DO DIREITO" in txt and "DESTAQUE" in txt:
                break

        text = bloco.get_text("\n", strip=True)
        fields = parse_labelled(text)
        if not all(k in fields for k in ("processo", "ramo", "tema", "destaque")):
            continue
        fields["cnot"] = cnot
        fields["link"] = urljoin(STJ_BASE,
            f"?aplicacao=informativo&acao=pesquisar&livre=@CNOT='{cnot}'")
        enunciados.append(fields)

    return enunciados


def parse_enunciados_strong(soup: BeautifulSoup) -> list[dict]:
    """Estratégia genérica: rótulos em tags <strong> (com ou sem dois-pontos)."""
    label_keys = {k.upper(): v for k, v in LABELS.items()}

    rotulos = [(normalize(s.get_text()).rstrip(":").strip().upper(), s)
               for s in soup.find_all("strong")
               if normalize(s.get_text()).rstrip(":").strip().upper() in label_keys]

    if not rotulos:
        return []

    resultado: list[dict] = []
    atual: dict[str, str] = {}

    for idx, (rotulo, el) in enumerate(rotulos):
        chave = label_keys[rotulo]
        prox_el = rotulos[idx + 1][1] if idx + 1 < len(rotulos) else None

        if chave == "processo" and atual:
            if all(k in atual for k in ("processo", "ramo", "tema", "destaque")):
                resultado.append(dict(atual))
            atual = {}

        partes: list[str] = []
        no = el.next_sibling
        while no is not None:
            if no is prox_el:
                break
            if hasattr(no, "name"):
                if no.name == "strong":
                    label_check = normalize(no.get_text()).rstrip(":").strip().upper()
                    if label_check in label_keys:
                        break
                href = no.get("href", "") if callable(getattr(no, "get", None)) else ""
                if href and "un.org" in href:
                    no = no.next_sibling
                    continue
                t = no.get_text(" ", strip=True)
                if t:
                    partes.append(t)
            elif isinstance(no, str) and no.strip():
                partes.append(no.strip())
            no = no.next_sibling

        conteudo = normalize(" ".join(partes))
        if conteudo:
            atual[chave] = conteudo

    if atual and all(k in atual for k in ("processo", "ramo", "tema", "destaque")):
        resultado.append(dict(atual))

    return resultado


def parse_enunciados_linear(soup: BeautifulSoup) -> list[dict]:
    """Fallback: pega o texto da pagina inteira e fatia por 'PROCESSO'."""
    text = soup.get_text("\n", strip=True)
    chunks = re.split(r"(?=^\s*PROCESSO\s*$)", text, flags=re.IGNORECASE | re.MULTILINE)
    out: list[dict] = []
    for ch in chunks:
        f = parse_labelled(ch)
        if not all(k in f for k in ("processo", "ramo", "tema", "destaque")):
            continue
        # tenta achar CNOT no chunk
        m = re.search(r"CNOT[^0-9]*([0-9]{4,})", ch)
        if m:
            f["cnot"] = m.group(1)
            f["link"] = urljoin(STJ_BASE,
                                f"?aplicacao=informativo&acao=pesquisar"
                                f"&livre=@CNOT='{f['cnot']}'")
        else:
            f["cnot"] = ""
            f["link"] = ""
        out.append(f)
    # dedup por (processo, primeiros 80 chars de destaque)
    dedup: dict[str, dict] = {}
    for e in out:
        key = (e["processo"][:60], e["destaque"][:80])
        dedup.setdefault(str(key), e)
    return list(dedup.values())


LABELS = {
    "PROCESSO":                    "processo",
    "RAMO DO DIREITO":             "ramo",
    "TEMA":                        "tema",
    "DESTAQUE":                    "destaque",
    "INFORMACOES DO INTEIRO TEOR": "inteiro_teor",
    "INFORMAÇÕES DO INTEIRO TEOR": "inteiro_teor",
}
_LABEL_RE = re.compile(
    r"^\s*(" + "|".join(re.escape(k) for k in LABELS) + r")\s*:?\s*$",
    re.IGNORECASE | re.MULTILINE,
)


def parse_labelled(text: str) -> dict:
    """Extrai pares rotulo->conteudo num texto que tem labels em linhas proprias."""
    if not text or not _LABEL_RE.search(text):
        return {}
    # quebra preservando posicoes de cada rotulo
    positions: list[tuple[int, str]] = []
    for m in _LABEL_RE.finditer(text):
        positions.append((m.start(), m.group(1).upper().strip()))
    positions.append((len(text), "__END__"))
    out: dict[str, str] = {}
    for (start, label), (end, _) in zip(positions, positions[1:]):
        # pula a propria linha do rotulo
        line_end = text.find("\n", start)
        if line_end == -1 or line_end >= end:
            continue
        chunk = text[line_end + 1:end].strip()
        chunk = normalize(chunk)
        key = LABELS.get(label, label.lower())
        if chunk:
            out[key] = chunk
    return out

# --------------------------------------------------------------------- gerador


PAGE_STYLE = """\
<style>
:root { --inf-accent: var(--blue, #2563eb); }
.inf-titulo {
  font-family: var(--serif, Georgia, serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--inf-accent);
  margin: 0 0 6px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border, #e5e5e5);
}
.inf-sub {
  font-size: 13px;
  color: var(--text2, #5f5f5f);
  margin-bottom: 24px;
  line-height: 1.55;
}
.inf-sub strong { color: var(--text, #1a1a1a); }
.inf-meta {
  display: inline-block;
  background: var(--blue-light, #eef3ff);
  color: var(--inf-accent);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .08em;
  text-transform: uppercase;
  padding: 4px 10px;
  border-radius: 999px;
  margin-right: 8px;
}
.inf-card {
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-left: 3px solid var(--inf-accent);
  border-radius: 10px;
  padding: 18px 20px;
  margin-bottom: 18px;
  transition: box-shadow .15s, transform .15s;
}
.inf-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,.06);
  transform: translateY(-1px);
}
.inf-card-head {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 14px;
  align-items: baseline;
  margin-bottom: 10px;
  padding-bottom: 10px;
  border-bottom: 1px dashed var(--border, #e5e5e5);
}
.inf-processo a {
  font-family: var(--mono, ui-monospace, SFMono-Regular, Menlo, monospace);
  font-size: 13px;
  font-weight: 700;
  color: var(--inf-accent);
  text-decoration: none;
}
.inf-processo a:hover { text-decoration: underline; }
.inf-ramo {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .07em;
  text-transform: uppercase;
  color: var(--text2, #5f5f5f);
}
.inf-tema {
  font-family: var(--serif, Georgia, serif);
  font-size: 16px;
  font-weight: 700;
  color: var(--text, #1a1a1a);
  margin: 4px 0 10px 0;
  line-height: 1.4;
}
.inf-destaque {
  font-size: 14px;
  color: var(--text, #1a1a1a);
  line-height: 1.65;
}
.inf-destaque p { margin: 0 0 8px 0; }
.inf-destaque p:last-child { margin-bottom: 0; }
.inf-rodape {
  margin-top: 32px;
  padding-top: 14px;
  border-top: 1px solid var(--border, #e5e5e5);
  font-size: 12px;
  color: var(--text2, #5f5f5f);
}
.inf-rodape a { color: var(--inf-accent); }
.inf-empty {
  text-align: center;
  padding: 40px 20px;
  color: var(--text2, #5f5f5f);
  font-style: italic;
}
</style>
"""


def render_edicao(edicao: int, data_edicao: str, enunciados: list[dict]) -> str:
    n = len(enunciados)
    sub = (f"Edição <strong>nº {edicao}</strong> · publicada em "
           f"<strong>{data_edicao}</strong> · "
           f"{n} enunciado{'s' if n != 1 else ''} de Direito Processual Penal.")
    cards = "\n".join(_render_card(e) for e in enunciados) if enunciados \
            else '<div class="inf-empty">Nenhum enunciado de Direito Processual Penal nesta edição.</div>'
    return (
        f"{PAGE_STYLE}\n"
        f'<h2 class="inf-titulo">'
        f'<span class="inf-meta">Informativo nº {edicao}</span>'
        f'STJ — {data_edicao}</h2>\n'
        f'<p class="inf-sub">{sub}</p>\n'
        f'{cards}\n'
        f'<div class="inf-rodape">Fonte oficial: '
        f'<a href="{STJ_BASE}?acao=pesquisarumaedicao&amp;livre=%27{edicao:04d}%27.cod." '
        f'target="_blank" rel="noopener">Informativo {edicao} no portal do STJ</a>.'
        f'</div>\n'
    )


def _render_card(e: dict) -> str:
    proc = h(e.get("processo", ""))
    link = e.get("link") or ""
    ramo = h(e.get("ramo", ""))
    tema = h(e.get("tema", ""))
    destaque = h(e.get("destaque", "")).replace("\n", "<br>")
    proc_html = (f'<a href="{h(link)}" target="_blank" rel="noopener">{proc}</a>'
                 if link else proc)
    return (
        '<article class="inf-card">'
          '<div class="inf-card-head">'
            f'<span class="inf-processo">{proc_html}</span>'
            f'<span class="inf-ramo">{ramo}</span>'
          '</div>'
          f'<div class="inf-tema">{tema}</div>'
          f'<div class="inf-destaque"><p>{destaque}</p></div>'
        '</article>'
    )


INDEX_STYLE = """\
<style>
.inf-idx-titulo {
  font-family: var(--serif, Georgia, serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--blue, #2563eb);
  margin: 0 0 6px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid var(--border, #e5e5e5);
}
.inf-idx-sub {
  font-size: 13px;
  color: var(--text2, #5f5f5f);
  margin-bottom: 24px;
  line-height: 1.6;
}
.inf-idx-list { list-style: none; padding: 0; margin: 0; }
.inf-idx-item {
  display: flex; flex-wrap: wrap; gap: 8px 14px; align-items: baseline;
  padding: 14px 0;
  border-bottom: 1px solid var(--border, #e5e5e5);
}
.inf-idx-num {
  font-family: var(--mono, ui-monospace, monospace);
  font-size: 13px; font-weight: 700;
  color: var(--blue, #2563eb);
  min-width: 110px;
}
.inf-idx-data { font-size: 12px; color: var(--text2, #5f5f5f); min-width: 110px; }
.inf-idx-link a {
  color: var(--text, #1a1a1a);
  text-decoration: none;
  font-weight: 600;
}
.inf-idx-link a:hover { color: var(--blue, #2563eb); text-decoration: underline; }
.inf-idx-qtd {
  font-size: 11px; color: var(--text2, #5f5f5f);
  background: var(--blue-light, #eef3ff);
  padding: 2px 8px; border-radius: 999px;
}
.inf-idx-vazio {
  text-align: center; padding: 40px 20px; color: var(--text2, #5f5f5f);
  font-style: italic;
}
</style>
"""


def render_index(state: dict) -> str:
    edicoes = state.get("edicoes", {})
    items: list[str] = []
    for n_str, meta in sorted(edicoes.items(), key=lambda kv: int(kv[0]), reverse=True):
        n   = int(n_str)
        qtd = meta.get("qtd_enunciados", 0)
        d   = meta.get("data", "—")
        items.append(
            f'<li class="inf-idx-item">'
            f'<span class="inf-idx-num">Informativo {n}</span>'
            f'<span class="inf-idx-data">{h(d)}</span>'
            f'<span class="inf-idx-link">'
            f'<a href="informativo-{n:04d}.html"'
            f' data-tema="conteudo/processual-penal-informativos-stj/informativo-{n:04d}.html">'
            f'Ver enunciados</a></span>'
            f'<span class="inf-idx-qtd">{qtd} enunciado{"s" if qtd != 1 else ""}</span>'
            f'</li>'
        )
    body = "\n".join(items) if items else (
        '<div class="inf-idx-vazio">Ainda não há informativos coletados. '
        'A próxima execução automática (toda 2ª-feira, 06:00 BRT) trará as edições novas.</div>'
    )
    return (
        f"{INDEX_STYLE}\n"
        f'<h2 class="inf-idx-titulo">Informativos do STJ — Direito Processual Penal</h2>\n'
        '<p class="inf-idx-sub">Coletânea automática dos enunciados de Direito Processual Penal '
        'publicados no <a href="' + STJ_BASE + '" target="_blank" rel="noopener">Informativo de '
        'Jurisprudência do STJ</a>. Atualizada toda 2ª-feira às 06:00 (Brasília).</p>\n'
        f'<ul class="inf-idx-list">\n{body}\n</ul>\n'
    )

# --------------------------------------------------------------------- STJ scrape


def extrair_data_titulo(soup: BeautifulSoup, numero: int) -> str:
    """Extrai a data da edição do <title> da página."""
    title_tag = soup.find("title")
    if not title_tag:
        return "Data não identificada"
    m = re.search(
        rf"n\.\s*0*{numero}\s*[-–]\s*(\d{{1,2}}\s+de\s+\w+\s+de\s+\d{{4}})",
        title_tag.get_text(), re.IGNORECASE)
    return m.group(1) if m else "Data não identificada"


def fetch_edicao(numero: int) -> Optional[tuple[str, list[dict]]]:
    """Retorna (data_edicao, enunciados) ou None se a edicao nao existe."""
    url = EDITION_URL_TPL.format(n=numero)
    log.info("Buscando edição %d: %s", numero, url)
    try:
        html = fetch(url)
    except Exception as exc:                              # noqa: BLE001
        log.error("Falha ao buscar edição %d: %s", numero, exc)
        return None

    if "não encontrad" in html.lower() or "nao encontrad" in html.lower():
        log.info("Edição %d não encontrada (ainda não publicada).", numero)
        return None

    # tenta extrair a data da edicao (formato: "Informativo de Jurisprudencia
    # n. NNN - DD de MES de AAAA.")
    soup = BeautifulSoup(html, "html.parser")
    data_edicao = extrair_data_titulo(soup, numero)

    todos = parse_enunciados(html)
    log.info("Edição %d: %d enunciados no total.", numero, len(todos))

    if not todos:
        log.info("HTML snippet (primeiros 5000 chars):\n%s", html[:5000])

    filtrados = [e for e in todos if RAMO_REGEX.search(e.get("ramo", ""))]
    log.info("Edição %d: %d enunciados de Processo Penal.", numero, len(filtrados))

    return data_edicao, filtrados


def fetch_latest_published_edition() -> Optional[int]:
    """Le a pagina inicial do informativo e tenta detectar o maior numero
    publicado. Retorna None se nao conseguir."""
    try:
        html = fetch(LISTING_URL)
    except Exception as exc:                              # noqa: BLE001
        log.warning("Não consegui ler listagem do STJ: %s", exc)
        return None
    nums = [int(m) for m in re.findall(
        r"Informativo\s+de\s+Jurisprud[êe]ncia\s+n\.?\s*0*(\d{2,4})",
        html, re.IGNORECASE)]
    if not nums:
        return None
    return max(nums)

# --------------------------------------------------------------------- main


def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--from", dest="start", type=int, default=None,
                   help="forca a edicao inicial (default: ultima_processada+1)")
    p.add_argument("--to", dest="end", type=int, default=None,
                   help="edicao final (inclusive) — default: ultima publicada no STJ")
    p.add_argument("--dry-run", action="store_true",
                   help="nao escreve arquivos, so loga")
    return p.parse_args()


def main() -> int:
    args = parse_args()
    state = load_state()

    start = args.start or (state["ultima_edicao_processada"] + 1)
    log.info("Inicio em informativo %d.", start)

    end = args.end
    if end is None:
        end = fetch_latest_published_edition()
        if end is None:
            log.warning("Sem listagem do STJ; tento ate %d.", start + 5)
            end = start + 5
    log.info("Tentando ate informativo %d.", end)

    novos = 0
    erro_sequencial = 0
    n = start
    while n <= end:
        result = fetch_edicao(n)
        if result is None:
            erro_sequencial += 1
            if erro_sequencial >= 3:
                log.info("3 edições seguidas sem retorno — paro.")
                break
            n += 1
            continue
        erro_sequencial = 0
        data_ed, enunciados = result

        out_html = render_edicao(n, data_ed, enunciados)
        target = TARGET_DIR / f"informativo-{n:04d}.html"
        if args.dry_run:
            log.info("[dry-run] geraria %s (%d enunciados)", target, len(enunciados))
        else:
            target.parent.mkdir(parents=True, exist_ok=True)
            target.write_text(out_html, encoding="utf-8")
            log.info("Gerado %s", target)

        state["edicoes"][str(n)] = {
            "data": data_ed,
            "qtd_enunciados": len(enunciados),
            "arquivo": f"informativo-{n:04d}.html",
        }
        state["ultima_edicao_processada"] = max(
            state["ultima_edicao_processada"], n)
        novos += 1
        n += 1
        time.sleep(1.5)   # gentileza com o STJ

    if novos == 0:
        log.info("Nenhuma edição nova hoje.")
        return 0

    if not args.dry_run:
        INDEX_FILE.write_text(render_index(state), encoding="utf-8")
        save_state(state)
        log.info("Index atualizado e estado gravado.")

    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except KeyboardInterrupt:
        log.warning("Interrompido pelo usuario.")
        sys.exit(130)
