# Design: Expansão de Informativos STJ para Direito Penal

**Data:** 2026-04-30

---

## Problema

O script `scripts/informativos_stj.py` e toda a sua configuração são hardcoded para "Direito Processual Penal". A seção "Direito Penal" do site não tem Jurisprudência. O objetivo é expandir o sistema para cobrir também os enunciados de DIREITO PENAL nos mesmos informativos do STJ, com o mesmo layout e mesmas funcionalidades.

---

## Escopo

- Parametrizar o script existente para suportar múltiplas matérias
- Adicionar entrada de Jurisprudência na seção Direito Penal do `data.js`
- Criar workflow de agendamento semanal no GitHub Actions
- Gerar informativos 885 e 886 para Direito Penal

---

## Regra de filtragem por ramo

Ambas as matérias usam **negative lookahead** para excluir entradas cujo único ramo é a variante militar:

| Matéria | Regex |
|---|---|
| Direito Processual Penal | `processual\s+penal(?!\s+militar)` (atualiza o atual) |
| Direito Penal | `DIREITO\s+PENAL(?!\s+MILITAR)` (novo) |

Comportamento esperado:

| Ramo do enunciado | Proc. Penal | Penal |
|---|---|---|
| `DIREITO PROCESSUAL PENAL` | ✓ | — |
| `DIREITO PROCESSUAL PENAL MILITAR` | ✗ | — |
| `DIREITO PENAL` | — | ✓ |
| `DIREITO PENAL MILITAR` | — | ✗ |
| `DIREITO PENAL, DIREITO PROCESSUAL PENAL` | ✓ | ✓ |
| `DIREITO PENAL MILITAR, DIREITO PENAL` | — | ✓ |
| `DIREITO PENAL MILITAR, DIREITO PROCESSUAL PENAL MILITAR, DIREITO PROCESSUAL PENAL` | ✓ | ✗ |

Enunciados com múltiplos ramos podem aparecer nas duas seções — comportamento correto.

---

## Arquitetura

### `scripts/informativos_stj.py`

Substituir as constantes hardcoded (`RAMO_REGEX`, `TARGET_DIR`, `STATE_FILE`, `INDEX_FILE`, `INITIAL_EDITION`) por um dict `MATERIAS` e uma função `get_materia_cfg(nome)`. Adicionar `--materia` ao CLI.

```python
MATERIAS = {
    "processual-penal": {
        "ramo_regex":  re.compile(r"processual\s+penal(?!\s+militar)", re.IGNORECASE),
        "target_dir":  REPO_ROOT / "conteudo" / "processual-penal-informativos-stj",
        "nome":        "Direito Processual Penal",
        "inicial":     886,
    },
    "penal": {
        "ramo_regex":  re.compile(r"DIREITO\s+PENAL(?!\s+MILITAR)", re.IGNORECASE),
        "target_dir":  REPO_ROOT / "conteudo" / "penal-informativos-stj",
        "nome":        "Direito Penal",
        "inicial":     885,
    },
}
```

O CLI ganha `--materia processual-penal|penal` (default: `processual-penal`), mantendo retro-compatibilidade com chamadas antigas sem o argumento.

Funções afetadas:
- `load_state` / `save_state` — recebem `cfg` em vez de usar `STATE_FILE` global
- `fetch_edicao` — usa `cfg["ramo_regex"]` e `cfg["nome"]` nos logs
- `render_edicao` / `render_index` — usam `cfg["nome"]` nos textos
- `git_push_edicoes` — usa `cfg["target_dir"]`
- `main` — lê `--materia`, seleciona cfg, passa para todas as funções

CSS (`PAGE_STYLE`, `INDEX_STYLE`, `_JUR_TOKENS_CSS`) e `_render_card`: **sem alteração**. As duas matérias usam o mesmo layout e tokens de cor.

### `data.js`

Adicionar turma `penal-informativos-stj` dentro do array `turmas` da matéria `id: "penal"`, após `penal-iv`:

```js
{
  id: "penal-informativos-stj",
  titulo: "Jurisprudência",
  indice: "conteudo/penal-informativos-stj/index.html",
  temas: []
}
```

### `.github/workflows/informativos-stj.yml` (novo)

```yaml
name: Informativos STJ
on:
  schedule:
    - cron: '0 9 * * 1'   # toda 2ª-feira, 06:00 BRT
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
      - run: pip install requests beautifulsoup4
      - name: Configurar git
        run: |
          git config user.name  "github-actions[bot]"
          git config user.email "github-actions[bot]@users.noreply.github.com"
      - name: Processual Penal
        run: python scripts/informativos_stj.py --materia processual-penal
      - name: Direito Penal
        run: python scripts/informativos_stj.py --materia penal
```

O git push fica a cargo do script (como hoje). Os dois steps rodam sequencialmente; o segundo step verá o estado atualizado após o push do primeiro.

---

## O que NÃO muda

- CSS: `_JUR_TOKENS_CSS`, `PAGE_STYLE`, `INDEX_STYLE`, `_render_card` — idênticos para as duas matérias
- Lógica de scraping, parsing, fallback de links, todas as estratégias de parser
- Estrutura de pastas do conteúdo existente (`processual-penal-informativos-stj/`)
- Chamadas ao script sem `--materia` (default `processual-penal` preserva comportamento atual)

---

## Arquivos modificados / criados

| Arquivo | Ação |
|---|---|
| `scripts/informativos_stj.py` | Modificar — parametrizar com `MATERIAS` e `--materia` |
| `scripts/tests/test_parser.py` | Modificar — testes para novo regex e parametrização |
| `data.js` | Modificar — adicionar turma `penal-informativos-stj` |
| `.github/workflows/informativos-stj.yml` | Criar — agendamento semanal |
| `conteudo/penal-informativos-stj/` | Criado pelo script (informativos 885 e 886) |
