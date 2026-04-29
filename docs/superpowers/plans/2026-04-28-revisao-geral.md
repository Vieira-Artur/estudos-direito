# Revisão Geral do Site — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Corrigir inconsistências visuais, padronizar componentes, melhorar UX em mobile e adicionar dark mode ao shell do site estudos-direito.

**Architecture:** Varredura temática — cada task cobre um tipo de problema em todos os arquivos afetados. Sem mudanças estruturais; apenas edições cirúrgicas dentro dos `<style>` e `<script>` existentes. Cada task termina com um commit.

**Tech Stack:** HTML/CSS estático, sem build system. Servido via GitHub Pages. Verificação manual no browser.

---

## Arquivos Modificados

| Arquivo | Tasks |
|---------|-------|
| `data.js` | 1 |
| `conteudo/processual-penal-ii/01-teoria-geral-provas.html` | 1, 3, 4 |
| `conteudo/processual-penal-ii/02-provas-em-especie.html` | 3, 4 |
| `conteudo/processual-penal-ii/03-prisoes.html` | 3, 4 |
| `conteudo/penal/penal-iv/01-fe-publica.html` | 2, 5 |
| `conteudo/penal/penal-iv/02-adm-publica.html` | 2, 5 |
| `conteudo/penal/penal-iv/03-sentimento-religioso.html` | 2, 5 |
| `conteudo/penal/penal-iv/04-dignidade-sexual.html` | 2, 5 |
| `conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html` | 6 |
| `style.css` | 7 |

---

## Task 1: Correções pontuais — data.js e bug .tag-gold

**Files:**
- Modify: `data.js`
- Modify: `conteudo/processual-penal-ii/01-teoria-geral-provas.html`

### 1.1 — data.js: descrição desatualizada

- [ ] **Abrir `data.js`** e localizar linha 75 (entrada de "Teoria Geral das Provas"):

```js
// ANTES (linha 75)
descricao: "Mapa mental · Prova vs elemento informativo · Sistemas de avaliação · Prova ilícita · Cadeia de custódia",

// DEPOIS
descricao: "Revisão geral · Prova vs elemento informativo · Sistemas de avaliação · Prova ilícita · Cadeia de custódia",
```

Nota: "Provas em Espécie" (linha 80) e "Prisões e Cautelares" (linha 85) já não contêm "Mapa mental" — não precisam de alteração.

### 1.2 — Bug .tag-gold em 01-teoria-geral-provas.html

- [ ] **Localizar** no `<style>` de `01-teoria-geral-provas.html` a linha:

```css
.tag-gold  { background: var(--blue-light); color: var(--blue); }
```

- [ ] **Substituir por:**

```css
.tag-gold  { background: var(--gold-light); color: var(--gold); }
```

### 1.3 — Verificar no browser

- [ ] Abrir o site localmente (abrir `index.html` no browser ou rodar `python -m http.server 8080` na raiz do projeto e acessar `http://localhost:8080`).
- [ ] Navegar até Processual Penal II. Confirmar que as três descrições na lista de temas mostram "Revisão geral" (não "Mapa mental").
- [ ] Abrir "Teoria Geral das Provas" e navegar para uma aba que use `.tag-gold`. Confirmar que o badge aparece dourado (fundo `#fdf6e3`, texto `#C9A84C`) e não azul.

### 1.4 — Commit

- [ ] Commitar:

```bash
git add data.js conteudo/processual-penal-ii/01-teoria-geral-provas.html
git commit -m "fix: descrições data.js e cor .tag-gold"
```

---

## Task 2: Padronizar font-size das abas — Penal IV

**Files:**
- Modify: `conteudo/penal/penal-iv/01-fe-publica.html`
- Modify: `conteudo/penal/penal-iv/02-adm-publica.html`
- Modify: `conteudo/penal/penal-iv/03-sentimento-religioso.html`
- Modify: `conteudo/penal/penal-iv/04-dignidade-sexual.html`

As páginas de Penal IV usam classes diferentes para o sistema de abas (`.fp-tab`, `.ap-tab`, `.sr-tab`, `.ds-tab`) mas todas definem `font-size: 14px`. O padrão do restante do site é `13px`. Padronizar.

- [ ] **Em `01-fe-publica.html`**, localizar no `<style>`:

```css
.fp-tab {
  padding: 7px 18px;
  font-size: 14px; font-weight: 600; font-family: var(--sans);
```

Alterar `font-size: 14px` → `font-size: 13px`.

- [ ] **Em `02-adm-publica.html`**, localizar no `<style>`:

```css
.ap-tab {
  padding: 7px 16px; font-size: 14px; font-weight: 600;
```

Alterar `font-size: 14px` → `font-size: 13px`.

- [ ] **Em `03-sentimento-religioso.html`**, localizar no `<style>`:

```css
.sr-tab {
  padding: 7px 18px;
  font-size: 14px; font-weight: 600;
```

Alterar `font-size: 14px` → `font-size: 13px`.

- [ ] **Em `04-dignidade-sexual.html`**, localizar no `<style>`:

```css
.ds-tab {
  padding: 7px 18px; font-size: 14px; font-weight: 600;
```

Alterar `font-size: 14px` → `font-size: 13px`.

- [ ] **Verificar no browser:** Abrir cada uma das 4 páginas de Penal IV e confirmar que as abas ficaram visivelmente menores (1px de diferença, mas perceptível em comparação com a aba ativa).

- [ ] **Commit:**

```bash
git add conteudo/penal/penal-iv/01-fe-publica.html \
        conteudo/penal/penal-iv/02-adm-publica.html \
        conteudo/penal/penal-iv/03-sentimento-religioso.html \
        conteudo/penal/penal-iv/04-dignidade-sexual.html
git commit -m "fix: padronizar font-size das abas de Penal IV para 13px"
```

---

## Task 3: Padronizar títulos de seção internos — Processual Penal II

**Files:**
- Modify: `conteudo/processual-penal-ii/01-teoria-geral-provas.html`
- Modify: `conteudo/processual-penal-ii/02-provas-em-especie.html`
- Modify: `conteudo/processual-penal-ii/03-prisoes.html`

A classe `.section-title` nestes três arquivos usa borda azul de 4px. O padrão das demais páginas (`.fp-sec`, `.tf-section-title`) é borda dourada de 3px. Padronizar.

- [ ] **Em cada um dos três arquivos**, localizar no `<style>`:

```css
.section-title {
  font-size: 1.3rem; color: var(--blue); border-left: 4px solid var(--blue);
  padding-left: 1rem; margin-bottom: 1.5rem; margin-top: 2.5rem;
}
```

Substituir por:

```css
.section-title {
  font-size: 1.3rem; color: var(--blue); border-left: 3px solid var(--gold);
  padding-left: 1rem; margin-bottom: 1.5rem; margin-top: 2.5rem;
}
```

(Apenas `border-left` muda: `4px solid var(--blue)` → `3px solid var(--gold)`)

- [ ] **Verificar no browser:** Abrir "Teoria Geral das Provas", navegar entre abas, e confirmar que os títulos de seção internos (ex: "Revisão Geral — Teoria Geral das Provas") agora têm a barra lateral dourada (`#C9A84C`) em vez de azul.

- [ ] **Commit:**

```bash
git add conteudo/processual-penal-ii/01-teoria-geral-provas.html \
        conteudo/processual-penal-ii/02-provas-em-especie.html \
        conteudo/processual-penal-ii/03-prisoes.html
git commit -m "fix: padronizar .section-title com borda dourada"
```

---

## Task 4: Mobile UX — Processual Penal II

**Files:**
- Modify: `conteudo/processual-penal-ii/01-teoria-geral-provas.html`
- Modify: `conteudo/processual-penal-ii/02-provas-em-especie.html`
- Modify: `conteudo/processual-penal-ii/03-prisoes.html`

- [ ] **Em `01-teoria-geral-provas.html`**, adicionar ao final do bloco `<style>` (antes do `</style>`):

```css
@media (max-width: 540px) {
  .pp1-tab { padding: 4px 9px; font-size: 11.5px; }
}
```

- [ ] **Em `02-provas-em-especie.html`**, adicionar ao final do bloco `<style>`:

```css
@media (max-width: 540px) {
  .pp2-tab { padding: 4px 9px; font-size: 11.5px; }
}
```

- [ ] **Em `03-prisoes.html`**, adicionar ao final do bloco `<style>`:

```css
@media (max-width: 540px) {
  .pp3-tab { padding: 4px 9px; font-size: 11.5px; }
}
```

- [ ] **Verificar no browser:** Abrir DevTools (F12), ativar modo responsivo (Ctrl+Shift+M no Chrome), selecionar largura 375px. Abrir "Prisões e Medidas Cautelares" (11 abas). Confirmar que as abas ficaram compactas e ocupam menos linhas verticais.

- [ ] **Commit:**

```bash
git add conteudo/processual-penal-ii/01-teoria-geral-provas.html \
        conteudo/processual-penal-ii/02-provas-em-especie.html \
        conteudo/processual-penal-ii/03-prisoes.html
git commit -m "feat: compactar abas em mobile (processual-penal-ii)"
```

---

## Task 5: Mobile UX — Penal IV

**Files:**
- Modify: `conteudo/penal/penal-iv/01-fe-publica.html`
- Modify: `conteudo/penal/penal-iv/02-adm-publica.html`
- Modify: `conteudo/penal/penal-iv/03-sentimento-religioso.html`
- Modify: `conteudo/penal/penal-iv/04-dignidade-sexual.html`

- [ ] **Em `01-fe-publica.html`**, adicionar ao final do bloco `<style>`:

```css
@media (max-width: 540px) {
  .fp-tab { padding: 4px 9px; font-size: 11.5px; }
}
```

- [ ] **Em `02-adm-publica.html`**, adicionar ao final do bloco `<style>`:

```css
@media (max-width: 540px) {
  .ap-tab { padding: 4px 9px; font-size: 11.5px; }
}
```

- [ ] **Em `03-sentimento-religioso.html`**, adicionar ao final do bloco `<style>`:

```css
@media (max-width: 540px) {
  .sr-tab { padding: 4px 9px; font-size: 11.5px; }
}
```

- [ ] **Em `04-dignidade-sexual.html`**, adicionar ao final do bloco `<style>`:

```css
@media (max-width: 540px) {
  .ds-tab { padding: 4px 9px; font-size: 11.5px; }
}
```

- [ ] **Verificar no browser:** Repetir verificação em 375px para uma página de Penal IV. Confirmar abas compactas.

- [ ] **Commit:**

```bash
git add conteudo/penal/penal-iv/01-fe-publica.html \
        conteudo/penal/penal-iv/02-adm-publica.html \
        conteudo/penal/penal-iv/03-sentimento-religioso.html \
        conteudo/penal/penal-iv/04-dignidade-sexual.html
git commit -m "feat: compactar abas em mobile (penal-iv)"
```

---

## Task 6: Mobile UX — Tributário

**Files:**
- Modify: `conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html`

- [ ] **Em `01-guia-estudos.html`**, adicionar ao final do bloco `<style>`:

```css
@media (max-width: 540px) {
  .tf-tab { padding: 4px 9px; font-size: 11.5px; }
}
```

- [ ] **Verificar no browser:** Abrir "Tributário Financeiro I" em 375px e confirmar abas compactas.

- [ ] **Commit:**

```bash
git add conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html
git commit -m "feat: compactar abas em mobile (tributário)"
```

---

## Task 7: Dark Mode no Shell

**Files:**
- Modify: `style.css`

O arquivo `style.css` contém os tokens globais em `:root` mas não tem bloco `@media (prefers-color-scheme: dark)`. O header já é escuro por padrão (gradiente `--blue-dark` → `--blue`), então apenas os tokens de fundo, superfície, borda e texto precisam mudar.

- [ ] **Localizar em `style.css`** o bloco `:root` (linha 1). Logo **após** o fechamento desse bloco (`}`), adicionar:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg:          #0f1923;
    --surface:     #162233;
    --border:      #1e3350;
    --text:        #e8edf5;
    --text2:       #8fa3bc;
    --blue-light:  #1a3050;
    --blue-hover:  #1a3050;
    --gold-light:  #2a2010;
  }
}
```

- [ ] **Verificar no browser — método A (macOS/Windows):** Mudar o sistema operacional para dark mode (Configurações → Personalização → Cores → Escuro). Recarregar o site. Confirmar:
  - Fundo da página fica escuro (`#0f1923`)
  - Cards/hero ficam com superfície escura (`#162233`)
  - Texto fica claro (`#e8edf5`)
  - Header continua com gradiente azul escuro (não muda — já era escuro)
  - Breadcrumb continua legível

- [ ] **Verificar no browser — método B (DevTools):** Abrir DevTools → aba "Rendering" → "Emulate CSS media feature prefers-color-scheme" → selecionar "dark". Mais rápido para testar sem mudar o sistema.

- [ ] **Verificar regressão:** Voltar para light mode e confirmar que o site continua igual ao estado anterior.

- [ ] **Commit:**

```bash
git add style.css
git commit -m "feat: dark mode no shell (style.css)"
```

---

## Task 8: Push para GitHub Pages

- [ ] Confirmar que todos os 7 commits anteriores estão presentes:

```bash
git log --oneline -8
```

Saída esperada (do mais recente para o mais antigo):
```
feat: dark mode no shell (style.css)
feat: compactar abas em mobile (tributário)
feat: compactar abas em mobile (penal-iv)
feat: compactar abas em mobile (processual-penal-ii)
fix: padronizar .section-title com borda dourada
fix: padronizar font-size das abas de Penal IV para 13px
fix: descrições data.js e cor .tag-gold
```

- [ ] **Push:**

```bash
git push origin master
```

- [ ] **Verificar no GitHub Pages** (aguardar ~1 min após push): Abrir `https://vieira-artur.github.io/estudos-direito/` e confirmar que o site está funcionando normalmente.
