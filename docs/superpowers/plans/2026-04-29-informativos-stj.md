# Informativos STJ — Correção e Automação Local

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir o parser do STJ (0 enunciados → correto), extrair a data da edição, adicionar git push automático e configurar Agendador de Tarefas do Windows.

**Architecture:** O script existente `scripts/informativos_stj.py` recebe uma nova estratégia primária de parsing (`parse_enunciados_cls`) que usa as classes CSS reais do portal STJ (`clsInformativoBlocoItem`, `clsInformativoTexto`, `clsDestaqueAzul`). As estratégias de fallback existentes ficam intactas. No final de `main()`, se houver edições novas, o script executa `git add / commit / push` via `subprocess`.

**Tech Stack:** Python 3.13, requests, beautifulsoup4, pytest, subprocess (stdlib), schtasks (Windows)

---

## Estrutura de Arquivos

| Arquivo | Ação | Responsabilidade |
|---|---|---|
| `scripts/informativos_stj.py` | Modificar | Parser, extração de data, git push |
| `scripts/tests/__init__.py` | Criar | Torna `tests` um pacote Python |
| `scripts/tests/test_parser.py` | Criar | Testes do novo parser e da extração de data |
| `scripts/executar-informativos.bat` | Criar | Launcher para o Agendador de Tarefas |
| `.gitignore` | Modificar | Adicionar `logs/` |

---

## Task 1: Instalar pytest e criar estrutura de testes

**Files:**
- Create: `scripts/tests/__init__.py`
- Create: `scripts/tests/test_parser.py`

- [ ] **Instalar pytest**

```
pip install pytest
```

Esperado: `Successfully installed pytest-...`

- [ ] **Criar `scripts/tests/__init__.py`** (arquivo vazio)

```
type nul > scripts\tests\__init__.py
```

- [ ] **Criar fixture HTML em `scripts/tests/test_parser.py`**

```python
import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from bs4 import BeautifulSoup

FIXTURE_886 = """\
<!DOCTYPE html>
<html>
<head><title>STJ - Informativo de Jurisprudência n. 886 - 28 de abril de 2026.</title></head>
<body>
<div class="clsInformativoBlocoItem">
  <div class="clsInformativoLabel">Processo</div>
  <div class="clsInformativoTexto">AgRg no REsp 2.000.001-SP, Rel. Ministro Teste, Quinta Turma, julgado em 15/4/2026.</div>
  <div class="clsInformativoLabel">Ramo do Direito</div>
  <div class="clsInformativoTexto">DIREITO PROCESSUAL PENAL</div>
  <div class="clsInformativoLabel">Tema</div>
  <div class="clsInformativoTexto">Habeas corpus. Prisão preventiva. Excesso de prazo.</div>
  <div class="clsInformativoLabel">Destaque</div>
  <div class="clsDestaqueAzul">Destaque</div>
  <div class="clsDestaqueAzul">O excesso de prazo na formação da culpa é causa de relaxamento da prisão preventiva.</div>
</div>
<div class="clsInformativoBlocoItem">
  <div class="clsInformativoLabel">Processo</div>
  <div class="clsInformativoTexto">REsp 3.000.001-RJ, Rel. Ministra Outra, Segunda Turma, julgado em 16/3/2026.</div>
  <div class="clsInformativoLabel">Ramo do Direito</div>
  <div class="clsInformativoTexto">DIREITO ADMINISTRATIVO</div>
  <div class="clsInformativoLabel">Tema</div>
  <div class="clsInformativoTexto">Licitação. Dispensa. Requisitos.</div>
  <div class="clsInformativoLabel">Destaque</div>
  <div class="clsDestaqueAzul">Destaque</div>
  <div class="clsDestaqueAzul">A dispensa de licitação exige demonstração de pressupostos legais.</div>
</div>
</body>
</html>
"""


def test_parse_enunciados_cls_retorna_so_processual_penal():
    from scripts.informativos_stj import parse_enunciados_cls
    soup = BeautifulSoup(FIXTURE_886, "html.parser")
    result = parse_enunciados_cls(soup)
    assert len(result) == 1
    assert result[0]["ramo"] == "DIREITO PROCESSUAL PENAL"


def test_parse_enunciados_cls_campos_corretos():
    from scripts.informativos_stj import parse_enunciados_cls
    soup = BeautifulSoup(FIXTURE_886, "html.parser")
    e = parse_enunciados_cls(soup)[0]
    assert "AgRg no REsp 2.000.001-SP" in e["processo"]
    assert "Habeas corpus" in e["tema"]
    assert "excesso de prazo" in e["destaque"].lower()


def test_extrair_data_do_titulo():
    from scripts.informativos_stj import extrair_data_titulo
    soup = BeautifulSoup(FIXTURE_886, "html.parser")
    data = extrair_data_titulo(soup, 886)
    assert data == "28 de abril de 2026"


def test_extrair_data_titulo_nao_encontrada():
    from scripts.informativos_stj import extrair_data_titulo
    soup = BeautifulSoup("<html><head><title>Sem data</title></head></html>", "html.parser")
    data = extrair_data_titulo(soup, 886)
    assert data == "Data não identificada"
```

- [ ] **Rodar os testes para confirmar que falham (ainda sem implementação)**

```
cd C:\Users\artur\Documents\estudos-direito
python -m pytest scripts/tests/test_parser.py -v
```

Esperado: 4 erros `ImportError` ou `AttributeError` — `parse_enunciados_cls` e `extrair_data_titulo` não existem ainda.

- [ ] **Commit**

```
git add scripts/tests/__init__.py scripts/tests/test_parser.py
git commit -m "test: testes para novo parser STJ e extração de data"
```

---

## Task 2: Implementar `parse_enunciados_cls` e `extrair_data_titulo`

**Files:**
- Modify: `scripts/informativos_stj.py`

- [ ] **Adicionar import `subprocess`** no bloco de imports no topo do arquivo (após `import time`)

Localizar a linha:
```python
import time
```
Substituir por:
```python
import subprocess
import time
```

- [ ] **Adicionar função `extrair_data_titulo`** logo antes da função `fetch_edicao` (linha ~618)

```python
def extrair_data_titulo(soup: BeautifulSoup, numero: int) -> str:
    """Extrai a data da edição do <title> da página."""
    title_tag = soup.find("title")
    if not title_tag:
        return "Data não identificada"
    m = re.search(
        rf"n\.\s*0*{numero}\s*[-–]\s*(\d{{1,2}}\s+de\s+\w+\s+de\s+\d{{4}})",
        title_tag.get_text(), re.IGNORECASE)
    return m.group(1) if m else "Data não identificada"
```

- [ ] **Adicionar função `parse_enunciados_cls`** logo antes de `parse_enunciados_resultado` (linha ~152)

```python
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
                    if len(t) > 20:
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
```

- [ ] **Inserir `parse_enunciados_cls` como primeira estratégia em `parse_enunciados`**

Localizar:
```python
    # estrategia 1: div.resultado (processo.stj.jus.br?from=feed)
    enunciados = parse_enunciados_resultado(soup)
    if enunciados:
        return enunciados
```

Substituir por:
```python
    # estrategia 1: clsInformativoBlocoItem (processo.stj.jus.br?from=feed — layout atual)
    enunciados = parse_enunciados_cls(soup)
    if enunciados:
        return enunciados

    # estrategia 2: div.resultado (processo.stj.jus.br?from=feed — layout anterior)
    enunciados = parse_enunciados_resultado(soup)
    if enunciados:
        return enunciados
```

- [ ] **Substituir extração de data em `fetch_edicao`**

Localizar o bloco (linhas ~634-640):
```python
    titulo = soup.get_text(" ", strip=True)
    m = re.search(
        rf"n[.º°]\s*0*{numero}\s*[-–]\s*"
        r"(\d{1,2}\s+de\s+\w+\s+de\s+\d{4})",
        titulo, re.IGNORECASE)
    data_edicao = m.group(1) if m else "Data não identificada"
```

Substituir por:
```python
    data_edicao = extrair_data_titulo(soup, numero)
```

- [ ] **Rodar os testes e confirmar que passam**

```
python -m pytest scripts/tests/test_parser.py -v
```

Esperado: 4 testes PASSED.

- [ ] **Commit**

```
git add scripts/informativos_stj.py
git commit -m "feat: parser STJ clsInformativoBlocoItem + extração de data do title"
```

---

## Task 3: Adicionar git commit + push automático

**Files:**
- Modify: `scripts/informativos_stj.py`

- [ ] **Adicionar função `git_push_edicoes`** logo antes de `def main()` (linha ~683)

```python
def git_push_edicoes(edicoes: list[int]) -> None:
    """Faz commit e push das edições novas geradas."""
    numeros = ", ".join(f"nº {n}" for n in sorted(edicoes))
    rel_dir = str(TARGET_DIR.relative_to(REPO_ROOT))
    try:
        subprocess.run(
            ["git", "-C", str(REPO_ROOT), "add", rel_dir],
            check=True, capture_output=True)
        subprocess.run(
            ["git", "-C", str(REPO_ROOT), "commit", "-m",
             f"feat: informativos STJ {numeros}"],
            check=True, capture_output=True)
        subprocess.run(
            ["git", "-C", str(REPO_ROOT), "push"],
            check=True, capture_output=True)
        log.info("Git push realizado: %s", numeros)
    except subprocess.CalledProcessError as exc:
        log.error("Falha no git push: %s", exc.stderr.decode(errors="replace"))
```

- [ ] **Rastrear edições novas em `main()`**

Localizar no início do loop while em `main()`:
```python
    novos = 0
    erro_sequencial = 0
    n = start
```

Substituir por:
```python
    novos = 0
    edicoes_novas: list[int] = []
    erro_sequencial = 0
    n = start
```

- [ ] **Registrar edição nova no loop**

Localizar dentro do loop while, após `novos += 1`:
```python
        novos += 1
        n += 1
```

Substituir por:
```python
        novos += 1
        edicoes_novas.append(n)
        n += 1
```

- [ ] **Chamar `git_push_edicoes` no final de `main()`**

Localizar:
```python
    if not args.dry_run:
        INDEX_FILE.write_text(render_index(state), encoding="utf-8")
        save_state(state)
        log.info("Index atualizado e estado gravado.")
```

Substituir por:
```python
    if not args.dry_run:
        INDEX_FILE.write_text(render_index(state), encoding="utf-8")
        save_state(state)
        log.info("Index atualizado e estado gravado.")
        git_push_edicoes(edicoes_novas)
```

- [ ] **Rodar todos os testes**

```
python -m pytest scripts/tests/test_parser.py -v
```

Esperado: 4 PASSED (sem regressão).

- [ ] **Commit**

```
git add scripts/informativos_stj.py
git commit -m "feat: git commit+push automático após coleta de informativos"
```

---

## Task 4: Criar launcher e atualizar .gitignore

**Files:**
- Create: `scripts/executar-informativos.bat`
- Modify: `.gitignore`

- [ ] **Criar `scripts/executar-informativos.bat`**

```bat
@echo off
cd /d C:\Users\artur\Documents\estudos-direito
if not exist logs mkdir logs
python scripts\informativos_stj.py >> logs\informativos.log 2>&1
```

- [ ] **Adicionar `logs/` ao `.gitignore`**

Abrir `.gitignore` e adicionar ao final:
```
logs/
```

- [ ] **Commit**

```
git add scripts/executar-informativos.bat .gitignore
git commit -m "feat: launcher .bat e logs no gitignore"
```

---

## Task 5: Configurar Agendador de Tarefas do Windows

- [ ] **Criar a tarefa agendada** (rodar este comando uma vez no terminal como Administrador, ou pedir permissão ao usuário)

```
schtasks /create /tn "InformativosSTJ" /tr "C:\Users\artur\Documents\estudos-direito\scripts\executar-informativos.bat" /sc WEEKLY /d MON /st 06:00 /f
```

Esperado: `AVISO: A tarefa agendada "InformativosSTJ" já existe. Ela será substituída...` ou `ÊXITO: A tarefa agendada "InformativosSTJ" foi criada com êxito.`

- [ ] **Verificar que a tarefa foi criada**

```
schtasks /query /tn "InformativosSTJ" /fo LIST
```

Esperado: mostrar Status, Próxima Execução (segunda-feira às 06:00).

---

## Task 6: Rodar dry-run e depois processar edição 886

- [ ] **Dry-run para verificar sem escrever arquivos**

```
cd C:\Users\artur\Documents\estudos-direito
python scripts\informativos_stj.py --from 886 --to 886 --dry-run
```

Esperado nos logs: `Edição 886: N enunciados no total.` e `Edição 886: M enunciados de Processo Penal.` — ambos > 0.

- [ ] **Apagar state e arquivos gerados anteriormente (reset limpo)**

```
del conteudo\processual-penal-informativos-stj\_state.json
del conteudo\processual-penal-informativos-stj\informativo-0886.html
```

- [ ] **Rodar de verdade para processar a edição 886**

```
python scripts\informativos_stj.py --from 886 --to 886
```

Esperado:
- `Gerado conteudo/processual-penal-informativos-stj/informativo-0886.html`
- `Index atualizado e estado gravado.`
- `Git push realizado: nº 886`

- [ ] **Confirmar no arquivo gerado que há enunciados**

Abrir `conteudo/processual-penal-informativos-stj/informativo-0886.html` e verificar que contém cards `.inf-card` com processo, ramo e destaque preenchidos. Não deve conter `"0 enunciados"`.
