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
import time
from html import escape as h
from pathlib import Path
from typing import Optional
from urllib.parse import quote, urljoin

from playwright.sync_api import sync_playwright
from bs4 import BeautifulSoup, Tag

# --------------------------------------------------------------------- config

REPO_ROOT       = Path(__file__).resolve().parent.parent
TARGET_DIR      = REPO_ROOT / "conteudo" / "processual-penal-informativos-stj"
STATE_FILE      = TARGET_DIR / "_state.json"
INDEX_FILE      = TARGET_DIR / "index.html"

STJ_BASE        = "https://scon.stj.jus.br/jurisprudencia/externo/informativo/"
EDITION_URL_TPL = STJ_BASE + "?acao=pesquisarumaedicao&livre=%27{n:04d}%27.cod."
LISTING_URL     = STJ_BASE + "?acao=pesquisar"

USER_AGENT      = ("Mozilla/5.0 (compatible; estudos-direito-bot/1.0; "
                   "+https://prof-artur-vieira.github.io/estudos-direito/)")

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

# --------------------------------------------------------------------- Playwright

_pw = None
_browser = None


def _ensure_browser():
    global _pw, _browser
    if _browser is None:
        _pw = sync_playwright().start()
        _browser = _pw.chromium.launch(
            headless=True,
            args=["--no-sandbox", "--disable-setuid-sandbox"],
        )
    return _browser


def _close_browser() -> None:
    global _pw, _browser
    if _browser:
        _browser.close()
        _browser = None
    if _pw:
        _pw.stop()
        _pw = None


def fetch(url: str, *, retries: int = 3, sleep: float = 2.0) -> str:
    last_exc: Optional[Exception] = None
    for attempt in range(1, retries + 1):
        try:
            page = _ensure_browser().new_page(
                user_agent=USER_AGENT,
                extra_http_headers={"Accept-Language": "pt-BR,pt;q=0.9,en;q=0.8"},
            )
            try:
                page.goto(url, wait_until="networkidle", timeout=60_000)
                return page.content()
            finally:
                page.close()
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

    # estrategia 1: cada enunciado costuma ficar dentro de um container que
    # contem um <a> com "CNOT=" no href.
    enunciados: list[dict] = []
    seen_cnots: set[str] = set()

    anchors = soup.find_all("a", href=re.compile(r"CNOT=", re.I))
    for a in anchors:
        href = a.get("href") or ""
        m = re.search(r"CNOT=%?27?([0-9]+)", href)
        if not m:
            continue
        cnot = m.group(1)
        if cnot in seen_cnots:
            continue
        seen_cnots.add(cnot)

        # sobe ate achar o bloco do enunciado (heuristica)
        bloco = a
        for _ in range(8):
            if bloco.parent is None:
                break
            bloco = bloco.parent
            txt = bloco.get_text(" ", strip=True).upper()
            if "RAMO DO DIREITO" in txt and "DESTAQUE" in txt:
                break

        dados = extract_fields(bloco)
        if not dados:
            continue
        dados["cnot"] = cnot
        dados["link"] = urljoin(STJ_BASE,
                                f"?aplicacao=informativo&acao=pesquisar"
                                f"&livre=@CNOT='{cnot}'")
        enunciados.append(dados)

    if enunciados:
        return enunciados

    # estrategia 2: tags <strong> como rotulos (processo.stj.jus.br + from=feed)
    enunciados = parse_enunciados_strong(soup)
    if enunciados:
        return enunciados

    # estrategia 3: parse linear por rotulos (fallback)
    return parse_enunciados_linear(soup)


def extract_fields(bloco: Tag) -> Optional[dict]:
    """Dado um bloco que parece um enunciado, extrai os 4 campos."""
    text = bloco.get_text("\n", strip=True)
    fields = parse_labelled(text)
    if not all(k in fields for k in ("processo", "ramo", "tema", "destaque")):
        return None
    return fields


def parse_enunciados_strong(soup: BeautifulSoup) -> list[dict]:
    """Estratégia para processo.stj.jus.br: rótulos ficam em tags <strong>."""
    label_keys = {k.upper(): v for k, v in LABELS.items()}

    # Encontra todos os <strong> cujo texto é exatamente um rótulo conhecido
    rotulos = [(normalize(s.get_text()).upper(), s)
               for s in soup.find_all("strong")
               if normalize(s.get_text()).upper() in label_keys]

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

        # Coleta texto dos irmãos seguintes até o próximo rótulo
        partes: list[str] = []
        no = el.next_sibling
        while no is not None:
            if no is prox_el:
                break
            if hasattr(no, "name"):
                if no.name == "strong" and normalize(no.get_text()).upper() in label_keys:
                    break
                # Ignora links de ícones ODS (brasil.un.org)
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
    titulo = soup.get_text(" ", strip=True)
    m = re.search(
        rf"n[.º°]\s*0*{numero}\s*[-–]\s*"
        r"(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})",
        titulo, re.IGNORECASE)
    data_edicao = m.group(1) if m else "Data não identificada"

    todos = parse_enunciados(html)
    log.info("Edição %d: %d enunciados no total.", numero, len(todos))

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
    try:
        return _main(args, state)
    finally:
        _close_browser()


def _main(args: argparse.Namespace, state: dict) -> int:
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
