# Prompt para colar no Claude Code

> **Como usar:** abra o terminal dentro da pasta do clone local de `Prof-Artur-Vieira/estudos-direito`, rode `claude`, e quando ele abrir cole **TUDO** que está abaixo da linha `=== INÍCIO DO PROMPT ===`. Pode confirmar com Enter.

---

=== INÍCIO DO PROMPT ===

Você está dentro do meu repositório `estudos-direito` (site GitHub Pages em HTML/JS estático, branch `master`). Vou te pedir para implementar um robô que mantém atualizada uma seção nova do site com os Informativos do STJ filtrados por "Direito Processual Penal", rodando toda 2ª-feira via GitHub Actions.

Antes de começar, faça um diagnóstico rápido e me confirme:

1. Você está mesmo dentro de `estudos-direito/` (deve existir `data.js`, `index.html`, e a pasta `conteudo/`)?
2. A branch atual é `master`?
3. Existem mudanças não commitadas que eu deveria saber?

Depois disso, execute as 6 tarefas abaixo, **nesta ordem**, e ao final me dê um resumo do que mudou.

---

## Tarefa 1 — Criar `scripts/informativos_stj.py`

Crie a pasta `scripts/` se não existir. Dentro dela, crie o arquivo `informativos_stj.py` com **exatamente** este conteúdo (preserve indentação, acentos e espaços em branco):

```python
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

import requests
from bs4 import BeautifulSoup, Tag

# --------------------------------------------------------------------- config

REPO_ROOT       = Path(__file__).resolve().parent.parent
TARGET_DIR      = REPO_ROOT / "conteudo" / "processual-penal-informativos-stj"
STATE_FILE      = TARGET_DIR / "_state.json"
INDEX_FILE      = TARGET_DIR / "index.html"

STJ_BASE        = "https://scon.stj.jus.br/jurisprudencia/externo/informativo/"
EDITION_URL_TPL = STJ_BASE + "?acao=pesquisarumaedicao&livre=%270{n:04d}%27.cod."
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

    # estrategia 2: parse linear por rotulos
    return parse_enunciados_linear(soup)


def extract_fields(bloco: Tag) -> Optional[dict]:
    """Dado um bloco que parece um enunciado, extrai os 4 campos."""
    text = bloco.get_text("\n", strip=True)
    fields = parse_labelled(text)
    if not all(k in fields for k in ("processo", "ramo", "tema", "destaque")):
        return None
    return fields


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
        f'<a href="{STJ_BASE}?acao=pesquisarumaedicao&amp;livre=%270{edicao:04d}%27.cod." '
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
            f'<a href="conteudo/processual-penal-informativos-stj/informativo-{n:04d}.html"'
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
```

Depois de criado, valide rodando: `python -m py_compile scripts/informativos_stj.py`. Se der erro, **pare** e me mostre o que aconteceu.

---

## Tarefa 2 — Criar `.github/workflows/informativos-stj.yml`

Crie a pasta `.github/workflows/` se não existir. Dentro dela, crie `informativos-stj.yml` com este conteúdo:

```yaml
name: Informativos STJ - Processo Penal

# Roda toda 2a-feira as 06:00 BRT (= 09:00 UTC).
# Tambem permite execucao manual pela aba "Actions" do GitHub.
on:
  schedule:
    - cron: "0 9 * * 1"
  workflow_dispatch:
    inputs:
      from_edition:
        description: "Edicao inicial (deixe vazio para retomar do estado)"
        required: false
        type: string
      to_edition:
        description: "Edicao final (deixe vazio para a mais recente)"
        required: false
        type: string

permissions:
  contents: write
  issues: write

concurrency:
  group: informativos-stj
  cancel-in-progress: false

jobs:
  coletar:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Python
        uses: actions/setup-python@v5
        with:
          python-version: "3.12"

      - name: Instalar dependencias
        run: |
          python -m pip install --upgrade pip
          pip install requests beautifulsoup4

      - name: Rodar scraper
        id: run
        env:
          FROM_ED: ${{ inputs.from_edition }}
          TO_ED:   ${{ inputs.to_edition }}
        run: |
          set -eo pipefail
          ARGS=""
          if [ -n "$FROM_ED" ]; then ARGS="$ARGS --from $FROM_ED"; fi
          if [ -n "$TO_ED"   ]; then ARGS="$ARGS --to   $TO_ED";   fi
          python scripts/informativos_stj.py $ARGS 2>&1 | tee scrape.log

      - name: Detectar mudancas
        id: diff
        run: |
          if [ -n "$(git status --porcelain conteudo/processual-penal-informativos-stj/)" ]; then
            echo "changed=true" >> "$GITHUB_OUTPUT"
          else
            echo "changed=false" >> "$GITHUB_OUTPUT"
          fi

      - name: Commit & push
        if: steps.diff.outputs.changed == 'true'
        run: |
          git config user.name  "informativos-stj-bot"
          git config user.email "actions@users.noreply.github.com"
          ED=$(python -c "import json; s=json.load(open('conteudo/processual-penal-informativos-stj/_state.json')); print(s.get('ultima_edicao_processada','?'))")
          git add conteudo/processual-penal-informativos-stj/
          git commit -m "Atualiza informativos STJ - ate a edicao ${ED}"
          git push

      - name: Abrir issue em caso de falha
        if: failure()
        uses: actions/github-script@v7
        with:
          script: |
            const fs = require('fs');
            let log = '';
            try { log = fs.readFileSync('scrape.log', 'utf8'); } catch (_) {}
            const tail = log.split('\n').slice(-80).join('\n');
            const body = [
              '## Falha na atualizacao automatica dos Informativos do STJ',
              '',
              `- Workflow run: ${context.serverUrl}/${context.repo.owner}/${context.repo.repo}/actions/runs/${context.runId}`,
              `- Tentativa em: ${new Date().toISOString()}`,
              '',
              '### Ultimas linhas do log',
              '```',
              tail || '(sem log capturado)',
              '```',
              '',
              'Possiveis causas: STJ fora do ar, mudanca de layout no portal,',
              'rate-limit, bloqueio temporario. Re-execute manualmente pela aba',
              'Actions; se persistir, o parser pode precisar de ajuste em ',
              '`scripts/informativos_stj.py`.'
            ].join('\n');
            await github.rest.issues.create({
              owner: context.repo.owner,
              repo:  context.repo.repo,
              title: `Informativos STJ: falha na execucao de ${new Date().toISOString().slice(0,10)}`,
              body,
              labels: ['informativos-stj','automacao']
            });
```

---

## Tarefa 3 — Criar `conteudo/processual-penal-informativos-stj/_state.json`

Crie a pasta `conteudo/processual-penal-informativos-stj/`. Dentro, o arquivo `_state.json`:

```json
{
  "ultima_edicao_processada": 885,
  "edicoes": {},
  "atualizado_em": null
}
```

---

## Tarefa 4 — Criar `conteudo/processual-penal-informativos-stj/index.html`

Na mesma pasta, crie `index.html`:

```html
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

<h2 class="inf-idx-titulo">Informativos do STJ — Direito Processual Penal</h2>
<p class="inf-idx-sub">Coletânea automática dos enunciados de Direito Processual Penal publicados no <a href="https://scon.stj.jus.br/jurisprudencia/externo/informativo/" target="_blank" rel="noopener">Informativo de Jurisprudência do STJ</a>. Atualizada toda 2ª-feira às 06:00 (Brasília), a partir da edição nº 886.</p>
<ul class="inf-idx-list">
<div class="inf-idx-vazio">Ainda não há informativos coletados. A próxima execução automática (toda 2ª-feira, 06:00 BRT) trará as edições novas a partir da nº 886.</div>
</ul>
```

---

## Tarefa 5 — Editar `data.js`

Abra o arquivo `data.js`. Localize a matéria `{ id: "processual-penal", titulo: "Direito Processual Penal", ... }` e dentro do array `turmas: [...]` dela, **acrescente uma 4ª entrada após o bloco `processual-penal-iii`**. Cuidado especial:

- Coloque vírgula no final do bloco `processual-penal-iii` se ainda não houver.
- A nova entrada é exatamente esta:

```js
,
{
  id: "processual-penal-informativos-stj",
  titulo: "Informativos do STJ",
  indice: "conteudo/processual-penal-informativos-stj/index.html",
  temas: []
}
```

Depois de editar, valide a sintaxe rodando: `node -e "require('./data.js'); console.log('ok')"` — se der erro, é provável que seja problema de vírgula. Se o `data.js` não for um module Node.js (não exporta nada), use isso em alternativa: `node -e "const fs=require('fs'); new Function(fs.readFileSync('data.js','utf8') + '; return materias;')(); console.log('ok')"`.

Mostre-me o trecho de `data.js` que você alterou (umas 30 linhas em volta) para eu conferir.

---

## Tarefa 6 — Validar tudo, commitar e empurrar

1. Rode `python -m py_compile scripts/informativos_stj.py` — não pode dar erro.
2. Rode `python -c "import json; json.load(open('conteudo/processual-penal-informativos-stj/_state.json')); print('json ok')"`.
3. Rode `git status` e me mostre a lista de arquivos novos/modificados.
4. Pergunte se posso prosseguir com o commit. Se eu autorizar:
   - `git add .github/ scripts/ conteudo/processual-penal-informativos-stj/ data.js`
   - `git commit -m "Adiciona robô de informativos STJ - Direito Processual Penal"`
   - `git push origin master`

Não execute o workflow ainda — vou disparar o primeiro `Run workflow` manualmente pela aba Actions do GitHub.

---

## O que me reportar ao final

- Lista de arquivos criados (com tamanho).
- Confirmação de que `data.js` foi editado e validado.
- Hash do commit que você criou.
- Qualquer erro ou aviso que tenha aparecido.

=== FIM DO PROMPT ===

---

## Depois que o Claude Code terminar

1. Vá em `https://github.com/Prof-Artur-Vieira/estudos-direito/actions`.
2. Clique no workflow **"Informativos STJ - Processo Penal"** na lista da esquerda.
3. Clique em **"Run workflow"** (verde, à direita), deixe os campos vazios e confirme.
4. Acompanhe o run pela própria aba. Em ~1 minuto, se deu certo, vai aparecer um commit novo no repo (`Atualiza informativos STJ - ate a edicao 886` ou número maior).
5. Abra o site, navegue em **Direito Processual Penal → Informativos do STJ** — a edição 886 (e seguintes que já estiverem publicadas) deve aparecer.
