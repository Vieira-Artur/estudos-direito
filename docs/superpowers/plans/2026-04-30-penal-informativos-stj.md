# Expansão Informativos STJ para Direito Penal

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Parametrizar `scripts/informativos_stj.py` para suportar múltiplas matérias, adicionar Direito Penal como segunda matéria, e criar agendamento semanal via GitHub Actions.

**Architecture:** Substituir as constantes hardcoded (`RAMO_REGEX`, `TARGET_DIR`, etc.) por um dict `MATERIAS` com configuração por matéria; todas as funções recebem `cfg: dict` em vez de usar globais. A CLI ganha `--materia processual-penal|penal` (default `processual-penal`). CSS, HTML e lógica de scraping ficam intactos.

**Tech Stack:** Python 3.13, pytest, requests, beautifulsoup4, GitHub Actions

---

## Estrutura de Arquivos

| Arquivo | Ação | O que muda |
|---|---|---|
| `scripts/informativos_stj.py` | Modificar | Config block → `MATERIAS`; 7 funções ganham parâmetro `cfg` |
| `scripts/tests/test_parser.py` | Modificar | 6 novos testes de regex e MATERIAS |
| `data.js` | Modificar | Turma `penal-informativos-stj` no array `turmas` da matéria `penal` |
| `.github/workflows/informativos-stj.yml` | Criar | Agendamento semanal |
| `conteudo/penal-informativos-stj/` | Criado pelo script | Informativos 885 e 886 |

---

## Task 1: Testes para nova configuração (red first)

**Files:**
- Modify: `scripts/tests/test_parser.py`

- [ ] **Adicionar 6 testes ao final de `scripts/tests/test_parser.py`**

```python
# ---- testes de regex e MATERIAS ----------------------------------------

def test_regex_proc_penal_exclui_somente_militar():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["processual-penal"]["ramo_regex"]
    assert not regex.search("DIREITO PROCESSUAL PENAL MILITAR")


def test_regex_proc_penal_inclui_misto():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["processual-penal"]["ramo_regex"]
    assert regex.search("DIREITO PENAL MILITAR, DIREITO PROCESSUAL PENAL, DIREITO PROCESSUAL PENAL MILITAR")


def test_regex_penal_exclui_somente_militar():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["penal"]["ramo_regex"]
    assert not regex.search("DIREITO PENAL MILITAR")


def test_regex_penal_nao_bate_processual_penal():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["penal"]["ramo_regex"]
    assert not regex.search("DIREITO PROCESSUAL PENAL")


def test_regex_penal_inclui_penal_puro():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["penal"]["ramo_regex"]
    assert regex.search("DIREITO PENAL")


def test_regex_penal_inclui_misto_com_processual():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["penal"]["ramo_regex"]
    assert regex.search("DIREITO PENAL, DIREITO PROCESSUAL PENAL")
```

- [ ] **Rodar para confirmar que os 6 falham (MATERIAS ainda não existe)**

```
cd C:\Users\artur\Documents\estudos-direito
python -m pytest scripts/tests/test_parser.py -v -k "regex or MATERIAS"
```

Esperado: 6 FAILED com `ImportError` ou `KeyError`.

- [ ] **Commit**

```
git add scripts/tests/test_parser.py
git commit -m "test: testes red para MATERIAS e regexes de ramo"
```

---

## Task 2: Parametrizar `informativos_stj.py`

**Files:**
- Modify: `scripts/informativos_stj.py` (linhas 35–55, 99–113, 759–787, 615–633, 714–743, 808–816, 819–836, 839–909)

### 2a — Substituir o bloco de config (linhas 35–55)

- [ ] **Localizar e substituir o bloco de constantes hardcoded**

Localizar (linhas 35–55):
```python
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
```

Substituir por:
```python
REPO_ROOT = Path(__file__).resolve().parent.parent

STJ_BASE        = "https://scon.stj.jus.br/jurisprudencia/externo/informativo/"
PROCESSO_BASE   = "https://processo.stj.jus.br/jurisprudencia/externo/informativo/"
# processo.stj.jus.br?from=feed retorna HTML estático (sem JS) e não bloqueia IPs de CI.
# As aspas (%27) em volta do número são obrigatórias para retornar a edição completa.
EDITION_URL_TPL = PROCESSO_BASE + "?acao=pesquisarumaedicao&livre=%27{n:04d}%27.cod.&from=feed"
LISTING_URL     = STJ_BASE + "?acao=pesquisar"

USER_AGENT = ("Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 "
              "(KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36")

# Configuração por matéria. Negative lookahead (?!\s+militar) exclui entradas
# cujo único ramo é a variante militar, mas inclui entradas com múltiplos ramos.
MATERIAS: dict[str, dict] = {
    "processual-penal": {
        "ramo_regex": re.compile(r"processual\s+penal(?!\s+militar)", re.IGNORECASE),
        "target_dir": REPO_ROOT / "conteudo" / "processual-penal-informativos-stj",
        "nome":       "Direito Processual Penal",
        "inicial":    886,
    },
    "penal": {
        "ramo_regex": re.compile(r"DIREITO\s+PENAL(?!\s+MILITAR)", re.IGNORECASE),
        "target_dir": REPO_ROOT / "conteudo" / "penal-informativos-stj",
        "nome":       "Direito Penal",
        "inicial":    885,
    },
}
```

### 2b — Atualizar `load_state` e `save_state`

- [ ] **Localizar e substituir `load_state` e `save_state`**

Localizar:
```python
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
```

Substituir por:
```python
def load_state(cfg: dict) -> dict:
    state_file = cfg["target_dir"] / "_state.json"
    if state_file.exists():
        return json.loads(state_file.read_text(encoding="utf-8"))
    return {
        "ultima_edicao_processada": cfg["inicial"] - 1,
        "edicoes": {},
        "atualizado_em": None,
    }


def save_state(state: dict, cfg: dict) -> None:
    state["atualizado_em"] = dt.datetime.now(dt.UTC).isoformat(timespec="seconds")
    cfg["target_dir"].mkdir(parents=True, exist_ok=True)
    state_file = cfg["target_dir"] / "_state.json"
    state_file.write_text(json.dumps(state, ensure_ascii=False, indent=2),
                          encoding="utf-8")
```

### 2c — Atualizar `fetch_edicao`

- [ ] **Localizar e substituir `fetch_edicao`**

Localizar:
```python
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
```

Substituir por:
```python
def fetch_edicao(numero: int, cfg: dict) -> Optional[tuple[str, list[dict]]]:
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

    soup = BeautifulSoup(html, "html.parser")
    data_edicao = extrair_data_titulo(soup, numero)

    todos = parse_enunciados(html)
    log.info("Edição %d: %d enunciados no total.", numero, len(todos))

    if not todos:
        log.info("HTML snippet (primeiros 5000 chars):\n%s", html[:5000])

    filtrados = [e for e in todos if cfg["ramo_regex"].search(e.get("ramo", ""))]
    log.info("Edição %d: %d enunciados de %s.", numero, len(filtrados), cfg["nome"])

    return data_edicao, filtrados
```

### 2d — Atualizar `render_edicao`

- [ ] **Localizar e substituir `render_edicao`**

Localizar:
```python
def render_edicao(edicao: int, data_edicao: str, enunciados: list[dict]) -> str:
    n = len(enunciados)
    sub = (f"Edição <strong>nº {edicao}</strong> · publicada em "
           f"<strong>{data_edicao}</strong> · "
           f"{n} enunciado{'s' if n != 1 else ''} de Direito Processual Penal.")
    cards = "\n".join(_render_card(e, i + 1) for i, e in enumerate(enunciados)) if enunciados \
            else '<div class="inf-empty">Nenhum enunciado de Direito Processual Penal nesta edição.</div>'
    return (
        f"{PAGE_STYLE}\n"
        f'<h2 class="inf-titulo">Informativo nº {edicao} '
        f'<span class="inf-meta">STJ</span>'
        f'<span class="inf-titulo-data"> — {data_edicao}</span></h2>\n'
        f'<p class="inf-sub">{sub}</p>\n'
        f'{cards}\n'
        f'<div class="inf-rodape">Fonte oficial: '
        f'<a href="{STJ_BASE}?acao=pesquisarumaedicao&amp;livre=%27{edicao:04d}%27.cod." '
        f'target="_blank" rel="noopener">Informativo {edicao} no portal do STJ</a>.'
        f'</div>\n'
    )
```

Substituir por:
```python
def render_edicao(edicao: int, data_edicao: str, enunciados: list[dict], cfg: dict) -> str:
    nome = cfg["nome"]
    n = len(enunciados)
    sub = (f"Edição <strong>nº {edicao}</strong> · publicada em "
           f"<strong>{data_edicao}</strong> · "
           f"{n} enunciado{'s' if n != 1 else ''} de {nome}.")
    cards = "\n".join(_render_card(e, i + 1) for i, e in enumerate(enunciados)) if enunciados \
            else f'<div class="inf-empty">Nenhum enunciado de {h(nome)} nesta edição.</div>'
    return (
        f"{PAGE_STYLE}\n"
        f'<h2 class="inf-titulo">Informativo nº {edicao} '
        f'<span class="inf-meta">STJ</span>'
        f'<span class="inf-titulo-data"> — {data_edicao}</span></h2>\n'
        f'<p class="inf-sub">{sub}</p>\n'
        f'{cards}\n'
        f'<div class="inf-rodape">Fonte oficial: '
        f'<a href="{STJ_BASE}?acao=pesquisarumaedicao&amp;livre=%27{edicao:04d}%27.cod." '
        f'target="_blank" rel="noopener">Informativo {edicao} no portal do STJ</a>.'
        f'</div>\n'
    )
```

### 2e — Atualizar `render_index`

- [ ] **Localizar e substituir `render_index`**

Localizar:
```python
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
```

Substituir por:
```python
def render_index(state: dict, cfg: dict) -> str:
    nome = cfg["nome"]
    dir_name = cfg["target_dir"].name
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
            f' data-tema="conteudo/{dir_name}/informativo-{n:04d}.html">'
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
        f'<h2 class="inf-idx-titulo">Informativos do STJ — {h(nome)}</h2>\n'
        f'<p class="inf-idx-sub">Coletânea automática dos enunciados de {h(nome)} '
        f'publicados no <a href="{STJ_BASE}" target="_blank" rel="noopener">Informativo de '
        f'Jurisprudência do STJ</a>. Atualizada toda 2ª-feira às 06:00 (Brasília).</p>\n'
        f'<ul class="inf-idx-list">\n{body}\n</ul>\n'
    )
```

### 2f — Atualizar `git_push_edicoes`

- [ ] **Localizar e substituir `git_push_edicoes`**

Localizar:
```python
def git_push_edicoes(edicoes: list[int]) -> None:
    """Faz commit e push das edições novas geradas."""
    numeros = ", ".join(f"nº {n}" for n in sorted(edicoes))
    rel_dir = str(TARGET_DIR.relative_to(REPO_ROOT))
```

Substituir por:
```python
def git_push_edicoes(edicoes: list[int], cfg: dict) -> None:
    """Faz commit e push das edições novas geradas."""
    numeros = ", ".join(f"nº {n}" for n in sorted(edicoes))
    rel_dir = str(cfg["target_dir"].relative_to(REPO_ROOT))
```

### 2g — Atualizar `parse_args` e `main`

- [ ] **Localizar e substituir `parse_args`**

Localizar:
```python
def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--from", dest="start", type=int, default=None,
                   help="forca a edicao inicial (default: ultima_processada+1)")
    p.add_argument("--to", dest="end", type=int, default=None,
                   help="edicao final (inclusive) — default: ultima publicada no STJ")
    p.add_argument("--dry-run", action="store_true",
                   help="nao escreve arquivos, so loga")
    return p.parse_args()
```

Substituir por:
```python
def parse_args() -> argparse.Namespace:
    p = argparse.ArgumentParser()
    p.add_argument("--materia", choices=list(MATERIAS), default="processual-penal",
                   help="matéria a coletar (default: processual-penal)")
    p.add_argument("--from", dest="start", type=int, default=None,
                   help="força a edição inicial (default: ultima_processada+1)")
    p.add_argument("--to", dest="end", type=int, default=None,
                   help="edição final (inclusive) — default: última publicada no STJ")
    p.add_argument("--dry-run", action="store_true",
                   help="não escreve arquivos, só loga")
    return p.parse_args()
```

- [ ] **Localizar e substituir `main`**

Localizar:
```python
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
    edicoes_novas: list[int] = []
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
        edicoes_novas.append(n)
        n += 1
        time.sleep(1.5)   # gentileza com o STJ

    if novos == 0:
        log.info("Nenhuma edição nova hoje.")
        return 0

    if not args.dry_run:
        INDEX_FILE.write_text(render_index(state), encoding="utf-8")
        save_state(state)
        log.info("Index atualizado e estado gravado.")
        git_push_edicoes(edicoes_novas)

    return 0
```

Substituir por:
```python
def main() -> int:
    args = parse_args()
    cfg = MATERIAS[args.materia]
    state = load_state(cfg)

    start = args.start or (state["ultima_edicao_processada"] + 1)
    log.info("Matéria: %s. Início em informativo %d.", cfg["nome"], start)

    end = args.end
    if end is None:
        end = fetch_latest_published_edition()
        if end is None:
            log.warning("Sem listagem do STJ; tento até %d.", start + 5)
            end = start + 5
    log.info("Tentando até informativo %d.", end)

    novos = 0
    edicoes_novas: list[int] = []
    erro_sequencial = 0
    n = start
    while n <= end:
        result = fetch_edicao(n, cfg)
        if result is None:
            erro_sequencial += 1
            if erro_sequencial >= 3:
                log.info("3 edições seguidas sem retorno — paro.")
                break
            n += 1
            continue
        erro_sequencial = 0
        data_ed, enunciados = result

        out_html = render_edicao(n, data_ed, enunciados, cfg)
        target = cfg["target_dir"] / f"informativo-{n:04d}.html"
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
        edicoes_novas.append(n)
        n += 1
        time.sleep(1.5)

    if novos == 0:
        log.info("Nenhuma edição nova hoje.")
        return 0

    if not args.dry_run:
        index_file = cfg["target_dir"] / "index.html"
        index_file.write_text(render_index(state, cfg), encoding="utf-8")
        save_state(state, cfg)
        log.info("Index atualizado e estado gravado.")
        git_push_edicoes(edicoes_novas, cfg)

    return 0
```

- [ ] **Rodar todos os testes — devem passar todos (8 antigos + 6 novos)**

```
python -m pytest scripts/tests/test_parser.py -v
```

Esperado: **14 PASSED**

- [ ] **Commit**

```
git add scripts/informativos_stj.py
git commit -m "refactor: parametrizar script com MATERIAS e --materia CLI"
```

---

## Task 3: `data.js` e GitHub Actions

**Files:**
- Modify: `data.js`
- Create: `.github/workflows/informativos-stj.yml`

### 3a — Adicionar turma em `data.js`

- [ ] **Localizar o fim do array `turmas` da matéria `penal` em `data.js`**

Localizar (a turma `penal-iv` é a última — encerrada pela chave que fecha o objeto da matéria):
```js
      }
    ]
  },
  {
    id: "processual-penal",
```

Substituir por:
```js
      },
      {
        id: "penal-informativos-stj",
        titulo: "Jurisprudência",
        indice: "conteudo/penal-informativos-stj/index.html",
        temas: []
      }
    ]
  },
  {
    id: "processual-penal",
```

- [ ] **Verificar que a entrada está presente**

```
python -c "
js = open('data.js', encoding='utf-8').read()
assert 'penal-informativos-stj' in js, 'turma ausente'
assert 'conteudo/penal-informativos-stj/index.html' in js, 'indice ausente'
print('OK — turma penal-informativos-stj presente em data.js')
"
```

Esperado: `OK — turma penal-informativos-stj presente em data.js`

### 3b — Criar GitHub Actions workflow

- [ ] **Criar `.github/workflows/informativos-stj.yml`**

```yaml
name: Informativos STJ

on:
  schedule:
    - cron: '0 9 * * 1'   # toda 2ª-feira às 09:00 UTC (06:00 BRT)
  workflow_dispatch:

jobs:
  coletar:
    runs-on: ubuntu-latest
    permissions:
      contents: write

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-python@v5
        with:
          python-version: '3.13'

      - name: Instalar dependências
        run: pip install requests beautifulsoup4

      - name: Configurar git
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"

      - name: Coletar — Direito Processual Penal
        run: python scripts/informativos_stj.py --materia processual-penal

      - name: Coletar — Direito Penal
        run: python scripts/informativos_stj.py --materia penal
```

- [ ] **Commit**

```
git add data.js .github/workflows/informativos-stj.yml
git commit -m "feat: turma penal-informativos-stj e workflow GitHub Actions"
```

---

## Task 4: Gerar informativos 885 e 886 para Direito Penal e publicar

**Files:**
- Created by script: `conteudo/penal-informativos-stj/informativo-0885.html`
- Created by script: `conteudo/penal-informativos-stj/informativo-0886.html`
- Created by script: `conteudo/penal-informativos-stj/index.html`
- Created by script: `conteudo/penal-informativos-stj/_state.json`

- [ ] **Rodar o script para Direito Penal (informativos 885 e 886)**

```
cd C:\Users\artur\Documents\estudos-direito
python scripts/informativos_stj.py --materia penal --from 885 --to 886
```

Esperado nos logs:
- `Matéria: Direito Penal. Início em informativo 885.`
- `Edição 885: N enunciados de Direito Penal.`
- `Edição 886: N enunciados de Direito Penal.`
- `Gerado …penal-informativos-stj/informativo-0885.html`
- `Gerado …penal-informativos-stj/informativo-0886.html`
- `Git push realizado: nº 885, nº 886`

- [ ] **Confirmar estrutura do HTML gerado**

```
python -c "
html = open('conteudo/penal-informativos-stj/informativo-0886.html', encoding='utf-8').read()
body = html[html.index('</style>'):]
assert 'inf-card-wrap' in body, 'wrapper ausente'
assert 'inf-num' in body, 'numero ausente'
assert body.index('inf-destaque') < body.index('inf-processo'), 'ordem errada'
assert 'inf-card-head' not in body, 'card-head nao removido'
assert 'Direito Penal' in html, 'nome da materia ausente'
print('OK — estrutura correta')
"
```

Esperado: `OK — estrutura correta`

- [ ] **Confirmar que o index lista os dois informativos**

```
python -c "
html = open('conteudo/penal-informativos-stj/index.html', encoding='utf-8').read()
assert 'Informativo 885' in html
assert 'Informativo 886' in html
assert 'Informativos do STJ — Direito Penal' in html
print('OK — index correto')
"
```

Esperado: `OK — index correto`

- [ ] **Verificar que a página de Processual Penal continua funcionando**

```
python -c "
html = open('conteudo/processual-penal-informativos-stj/informativo-0886.html', encoding='utf-8').read()
assert 'Informativo n' in html
assert 'inf-card-wrap' in html
print('OK — processual penal intacto')
"
```

Esperado: `OK — processual penal intacto`
