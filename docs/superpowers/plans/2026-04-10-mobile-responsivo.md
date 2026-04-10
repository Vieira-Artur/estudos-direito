# Mobile Responsivo — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tornar o site usável em celular sem alterar nada no desktop.

**Architecture:** Três mudanças independentes — (1) CSS puro na home, (2) CSS puro nas abas de conteúdo, (3) uma linha de CSS que esconde o header interno carregado via fetch. Nenhuma mudança de lógica JS além de uma classe CSS.

**Tech Stack:** HTML, CSS, JavaScript vanilla — sem dependências externas.

---

## Mapa de Arquivos

| Arquivo | O que muda |
|---|---|
| `style.css` | Media query home + ocultar header interno |
| `conteudo/processual-penal-ii/03-prisoes.html` | Media query abas |
| `conteudo/processual-penal-ii/01-teoria-geral-provas.html` | Media query abas |
| `conteudo/processual-penal-ii/02-provas-em-especie.html` | Media query abas |
| `conteudo/penal/penal-iv/01-fe-publica.html` | Media query abas |
| `conteudo/penal/penal-iv/02-adm-publica.html` | Media query abas |
| `conteudo/penal/penal-iv/index.html` | Media query abas (se tiver nav) |
| `conteudo/tributario/tributario-financeiro-i/01-atividade-avaliativa.html` | Media query abas |

---

## Task 1: Home mobile — empilhar árvore verticalmente

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Adicionar media query no final de `style.css`**

Abrir `style.css` e adicionar ao final do arquivo:

```css
/* ── Mobile (≤ 768px) ── */
@media (max-width: 768px) {
  .arvore {
    flex-direction: column;
    overflow-x: visible;
    padding-bottom: 0;
  }

  .ramo {
    width: 100%;
    max-width: 100%;
    min-width: unset;
    flex-direction: column;
  }

  .ramo + .ramo::before {
    display: none;
  }

  .no-materia {
    width: 100%;
  }

  .turmas-lista {
    padding: 0 0 0 12px;
    width: 100%;
  }
}
```

- [ ] **Step 2: Verificar no navegador**

Abrir `index.html` no navegador. Abrir DevTools (`F12`) → toggle device toolbar (`Ctrl+Shift+M`) → selecionar largura 390px (iPhone 14).

Resultado esperado:
- Matérias empilhadas verticalmente, cada uma ocupando 100% da largura
- Temas listados abaixo de cada turma, sem scroll horizontal
- Sem separador vertical entre matérias

Resultado NÃO esperado:
- Scroll horizontal na home
- Colunas cortadas ou sobrepostas

- [ ] **Step 3: Verificar desktop intacto**

Na mesma aba, voltar para largura > 768px (ou sair do device toolbar). A árvore horizontal deve estar idêntica ao estado anterior.

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: empilhar árvore verticalmente no mobile (≤768px)"
```

---

## Task 2: Abas internas — faixa deslizante (PP II)

**Files:**
- Modify: `conteudo/processual-penal-ii/03-prisoes.html`
- Modify: `conteudo/processual-penal-ii/01-teoria-geral-provas.html`
- Modify: `conteudo/processual-penal-ii/02-provas-em-especie.html`

O bloco CSS a adicionar é **idêntico nos 3 arquivos**. Em cada arquivo, localizar o fechamento do `<style>` (linha com `</style>`) e inserir o bloco abaixo **imediatamente antes**:

```css
  @media (max-width: 768px) {
    nav {
      display: flex;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      grid-template-columns: unset;
    }
    nav button {
      white-space: nowrap;
      flex-shrink: 0;
      border-right: 1px solid var(--border);
    }
  }
```

- [ ] **Step 1: Editar `03-prisoes.html`**

Localizar (perto da linha 144):
```css
  @media(max-width:600px){.grid-2,.grid-3{grid-template-columns:1fr;}header h1{font-size:1.4rem;}.tab-content{padding:1rem;}}
</style>
```

Substituir por:
```css
  @media(max-width:600px){.grid-2,.grid-3{grid-template-columns:1fr;}header h1{font-size:1.4rem;}.tab-content{padding:1rem;}}
  @media (max-width: 768px) {
    nav {
      display: flex;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      grid-template-columns: unset;
    }
    nav button {
      white-space: nowrap;
      flex-shrink: 0;
      border-right: 1px solid var(--border);
    }
  }
</style>
```

- [ ] **Step 2: Editar `01-teoria-geral-provas.html`**

Localizar no `<style>` a linha que contém `@media(max-width:600px)` e o `</style>` que a segue. Inserir o mesmo bloco abaixo do media query existente, antes de `</style>`:

```css
  @media (max-width: 768px) {
    nav {
      display: flex;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      grid-template-columns: unset;
    }
    nav button {
      white-space: nowrap;
      flex-shrink: 0;
      border-right: 1px solid var(--border);
    }
  }
</style>
```

- [ ] **Step 3: Editar `02-provas-em-especie.html`**

Mesma operação do Step 2.

- [ ] **Step 4: Verificar no navegador**

Abrir `index.html` → navegar até PP II → Prisões. No DevTools com 390px:
- As abas devem aparecer em faixa única horizontal
- Deslizar para o lado deve revelar as abas seguintes (Flagrante, Preventiva, etc.)
- Conteúdo deve começar logo abaixo das abas, sem fileiras de botões

- [ ] **Step 5: Commit**

```bash
git add conteudo/processual-penal-ii/03-prisoes.html \
        conteudo/processual-penal-ii/01-teoria-geral-provas.html \
        conteudo/processual-penal-ii/02-provas-em-especie.html
git commit -m "feat: abas PP II em faixa deslizante no mobile"
```

---

## Task 3: Abas internas — faixa deslizante (Penal IV + Tributário)

**Files:**
- Modify: `conteudo/penal/penal-iv/01-fe-publica.html`
- Modify: `conteudo/penal/penal-iv/02-adm-publica.html`
- Modify: `conteudo/tributario/tributario-financeiro-i/01-atividade-avaliativa.html`

Bloco CSS a inserir antes de `</style>` em cada arquivo (idêntico ao Task 2):

```css
  @media (max-width: 768px) {
    nav {
      display: flex;
      overflow-x: auto;
      -webkit-overflow-scrolling: touch;
      grid-template-columns: unset;
    }
    nav button {
      white-space: nowrap;
      flex-shrink: 0;
      border-right: 1px solid var(--border);
    }
  }
```

- [ ] **Step 1: Editar `01-fe-publica.html`** — inserir bloco antes de `</style>`

- [ ] **Step 2: Editar `02-adm-publica.html`** — inserir bloco antes de `</style>`

- [ ] **Step 3: Editar `01-atividade-avaliativa.html`**

Neste arquivo o nav tem `grid-template-columns: 1fr` (só 1 coluna, 1 aba). O bloco ainda deve ser inserido para consistência futura, mas o impacto visual é mínimo.

- [ ] **Step 4: Verificar no navegador**

Abrir `index.html` → navegar até Penal IV → Fé Pública. No DevTools 390px: abas em faixa horizontal deslizável.

- [ ] **Step 5: Commit**

```bash
git add conteudo/penal/penal-iv/01-fe-publica.html \
        conteudo/penal/penal-iv/02-adm-publica.html \
        conteudo/tributario/tributario-financeiro-i/01-atividade-avaliativa.html
git commit -m "feat: abas Penal IV e Tributário em faixa deslizante no mobile"
```

---

## Task 4: Eliminar cabeçalho duplo

**Files:**
- Modify: `style.css`

Quando um tema é carregado via `fetch()` e injetado em `#conteudo-area`, o `<header>` interno da página (com badge, título e nome do professor) vira filho direto de `#conteudo-area`. O breadcrumb externo já mostra onde o aluno está — o header interno é redundante.

- [ ] **Step 1: Adicionar regra em `style.css`**

Abrir `style.css`. Dentro do bloco `@media (max-width: 768px)` criado na Task 1, adicionar:

```css
  #conteudo-area > header {
    display: none;
  }
```

O bloco final do media query deve ficar assim:

```css
@media (max-width: 768px) {
  .arvore {
    flex-direction: column;
    overflow-x: visible;
    padding-bottom: 0;
  }

  .ramo {
    width: 100%;
    max-width: 100%;
    min-width: unset;
    flex-direction: column;
  }

  .ramo + .ramo::before {
    display: none;
  }

  .no-materia {
    width: 100%;
  }

  .turmas-lista {
    padding: 0 0 0 12px;
    width: 100%;
  }

  #conteudo-area > header {
    display: none;
  }
}
```

**Nota:** Esconder apenas em mobile porque no desktop o header interno fornece contexto visual útil. Se no futuro quiser esconder também no desktop, mover a regra para fora do media query.

- [ ] **Step 2: Verificar no navegador — mobile**

DevTools 390px → abrir qualquer tema (ex: Prisões). Resultado esperado:
- Só aparece o breadcrumb no topo: `Início › Proc. Penal › PP II › Prisões`
- Nenhum header com badge azul escuro e subtítulo "Prof. Artur Vieira"
- Conteúdo (abas) começa logo abaixo do breadcrumb

- [ ] **Step 3: Verificar no navegador — desktop**

Largura > 768px → abrir mesmo tema. Resultado esperado:
- Header interno ainda visível (badge + título + subtítulo)
- Visual idêntico ao atual

- [ ] **Step 4: Commit**

```bash
git add style.css
git commit -m "feat: ocultar header interno de conteúdo no mobile"
```

---

## Task 5: Push e limpeza

- [ ] **Step 1: Push para GitHub**

```bash
git push origin master
```

- [ ] **Step 2: Verificar no GitHub Pages**

Aguardar ~2 min e acessar o site no celular ou via DevTools. Testar:
- Home: matérias empilhadas verticalmente
- PP II → Prisões: abas deslizantes, sem header duplicado
- Penal IV → Fé Pública: abas deslizantes
- Tributário → Atividade Avaliativa: aba única, sem problema

- [ ] **Step 3: Remover mockup temporário**

```bash
git rm mockup-mobile.html
git commit -m "chore: remove arquivo de mockup temporário"
git push origin master
```
