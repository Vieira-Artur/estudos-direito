# Redesign do Card de Julgado — Destaque Primeiro, Número na Margem

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganizar o card de julgado para mostrar DESTAQUE primeiro (com número na margem esquerda) e PROCESSO/RAMO no rodapé, eliminando o cabeçalho atual.

**Architecture:** Todas as mudanças estão em `scripts/informativos_stj.py`: o CSS `PAGE_STYLE` ganha dois novos seletores (`.inf-card-wrap`, `.inf-num`) e perde `.inf-card-head`; `_render_card(e)` vira `_render_card(e, idx)` e reordena o HTML; `render_edicao` passa o índice via `enumerate`. O HTML gerado (`informativo-0886.html`) é regenerado no final.

**Tech Stack:** Python 3.13, pytest, requests, beautifulsoup4

---

## Estrutura de Arquivos

| Arquivo | Ação | O que muda |
|---|---|---|
| `scripts/informativos_stj.py` | Modificar | CSS, `_render_card`, `render_edicao` |
| `scripts/tests/test_parser.py` | Modificar | Testes para `_render_card` com índice |

---

## Task 1: Escrever testes para o novo `_render_card`

**Files:**
- Modify: `scripts/tests/test_parser.py`

- [ ] **Adicionar os testes ao final de `scripts/tests/test_parser.py`**

```python
def test_render_card_tem_wrapper_e_numero():
    from scripts.informativos_stj import _render_card
    e = {
        "processo": "AgRg no HC 123-SP",
        "link": "",
        "ramo": "DIREITO PROCESSUAL PENAL",
        "tema": "Tema do julgado.",
        "destaque": "O STJ decidiu que X.",
    }
    html = _render_card(e, 2)
    assert 'class="inf-card-wrap"' in html
    assert 'class="inf-num"' in html
    assert ">2<" in html


def test_render_card_destaque_antes_de_processo():
    from scripts.informativos_stj import _render_card
    e = {
        "processo": "AgRg no HC 123-SP",
        "link": "",
        "ramo": "DIREITO PROCESSUAL PENAL",
        "tema": "Tema.",
        "destaque": "O STJ decidiu que X.",
    }
    html = _render_card(e, 1)
    pos_destaque = html.index("inf-destaque")
    pos_processo = html.index("inf-processo")
    assert pos_destaque < pos_processo, "destaque deve aparecer antes do processo no HTML"


def test_render_card_sem_card_head():
    from scripts.informativos_stj import _render_card
    e = {
        "processo": "AgRg no HC 123-SP",
        "link": "",
        "ramo": "DIREITO PROCESSUAL PENAL",
        "tema": "Tema.",
        "destaque": "O STJ decidiu que X.",
    }
    html = _render_card(e, 1)
    assert "inf-card-head" not in html


def test_render_card_rodape_tem_processo_e_ramo():
    from scripts.informativos_stj import _render_card
    e = {
        "processo": "AgRg no HC 123-SP",
        "link": "",
        "ramo": "DIREITO PROCESSUAL PENAL",
        "tema": "Tema.",
        "destaque": "O STJ decidiu que X.",
    }
    html = _render_card(e, 1)
    assert 'class="inf-card-foot"' in html
    assert "AgRg no HC 123-SP" in html
    assert "DIREITO PROCESSUAL PENAL" in html
```

- [ ] **Rodar os testes para confirmar que os 4 novos falham**

```
cd C:\Users\artur\Documents\estudos-direito
python -m pytest scripts/tests/test_parser.py -v -k "render_card"
```

Esperado: 4 FAILED com `TypeError` (assinatura errada) ou `AssertionError`.

- [ ] **Commit**

```
git add scripts/tests/test_parser.py
git commit -m "test: testes para novo _render_card com índice e estrutura reorganizada"
```

---

## Task 2: Atualizar CSS em `PAGE_STYLE`

**Files:**
- Modify: `scripts/informativos_stj.py` (linhas 482–549)

- [ ] **Substituir o bloco `.inf-card` + `.inf-card-head`**

Localizar:
```python
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
```

Substituir por:
```python
.inf-card-wrap {
  display: flex;
  gap: 12px;
  align-items: flex-start;
  margin-bottom: 18px;
}
.inf-num {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: var(--inf-accent);
  color: #fff;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 18px;
}
.inf-card {
  flex: 1;
  background: var(--surface, #fff);
  border: 1px solid var(--border, #e5e5e5);
  border-left: 3px solid var(--inf-accent);
  border-radius: 10px;
  padding: 18px 20px;
  transition: box-shadow .15s, transform .15s;
}
.inf-card:hover {
  box-shadow: 0 6px 20px rgba(0,0,0,.06);
  transform: translateY(-1px);
}
.inf-card-foot {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px dashed var(--border, #e5e5e5);
  display: flex;
  flex-wrap: wrap;
  gap: 6px 14px;
  align-items: baseline;
}
```

- [ ] **Rodar os testes anteriores (não devem regredir)**

```
python -m pytest scripts/tests/test_parser.py -v -k "not render_card"
```

Esperado: 4 PASSED (os testes de parser e data não são afetados por CSS).

- [ ] **Commit**

```
git add scripts/informativos_stj.py
git commit -m "style: CSS inf-card-wrap e inf-num, remove inf-card-head"
```

---

## Task 3: Reescrever `_render_card` e atualizar `render_edicao`

**Files:**
- Modify: `scripts/informativos_stj.py` (linhas 575–592 e 559)

- [ ] **Substituir `_render_card`**

Localizar:
```python
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
          f'<div class="inf-destaque" lang="pt-BR"><p>{destaque}</p></div>'
        '</article>'
    )
```

Substituir por:
```python
def _render_card(e: dict, idx: int) -> str:
    proc = h(e.get("processo", ""))
    link = e.get("link") or ""
    ramo = h(e.get("ramo", ""))
    tema = h(e.get("tema", ""))
    destaque = h(e.get("destaque", "")).replace("\n", "<br>")
    proc_html = (f'<a href="{h(link)}" target="_blank" rel="noopener">{proc}</a>'
                 if link else proc)
    return (
        '<div class="inf-card-wrap">'
          f'<div class="inf-num">{idx}</div>'
          '<article class="inf-card">'
            f'<div class="inf-destaque" lang="pt-BR"><p>{destaque}</p></div>'
            f'<div class="inf-tema">{tema}</div>'
            '<div class="inf-card-foot">'
              f'<span class="inf-processo">{proc_html}</span>'
              f'<span class="inf-ramo">{ramo}</span>'
            '</div>'
          '</article>'
        '</div>'
    )
```

- [ ] **Atualizar `render_edicao` para passar o índice**

Localizar:
```python
    cards = "\n".join(_render_card(e) for e in enunciados) if enunciados \
```

Substituir por:
```python
    cards = "\n".join(_render_card(e, i + 1) for i, e in enumerate(enunciados)) if enunciados \
```

- [ ] **Rodar todos os testes**

```
python -m pytest scripts/tests/test_parser.py -v
```

Esperado: **8 PASSED** (4 antigos + 4 novos de render_card).

- [ ] **Commit**

```
git add scripts/informativos_stj.py
git commit -m "feat: card julgado com número na margem e destaque em primeiro"
```

---

## Task 4: Regenerar HTML e publicar

- [ ] **Apagar state e HTML antigos**

```
del conteudo\processual-penal-informativos-stj\_state.json
del conteudo\processual-penal-informativos-stj\informativo-0886.html
```

- [ ] **Rodar o script para regenerar**

```
cd C:\Users\artur\Documents\estudos-direito
python scripts\informativos_stj.py --from 886 --to 886
```

Esperado:
- `Edição 886: 3 enunciados de Processo Penal.`
- `Gerado …informativo-0886.html`
- `Git push realizado: nº 886`

- [ ] **Confirmar o HTML gerado**

```
python -c "
html = open('conteudo/processual-penal-informativos-stj/informativo-0886.html', encoding='utf-8').read()
assert 'inf-card-wrap' in html, 'wrapper ausente'
assert 'inf-num' in html, 'numero ausente'
assert html.index('inf-destaque') < html.index('inf-processo'), 'ordem errada'
assert 'inf-card-head' not in html, 'card-head nao removido'
print('OK — estrutura correta')
"
```

Esperado: `OK — estrutura correta`
