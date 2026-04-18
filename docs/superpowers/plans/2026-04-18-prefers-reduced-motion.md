# prefers-reduced-motion — Abordagem Caso a Caso

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Substituir o killswitch global de animações por regras `prefers-reduced-motion` caso a caso, preservando feedback visual (cor, sombra, opacidade) e eliminando apenas movimento (transform, translate, scroll suave).

**Architecture:** Todas as mudanças ficam em `style.css` (remoção do killswitch + media queries por seletor) e em dois arquivos JS/HTML (`app.js` para scroll programático, `index.html`/`404.html` para o botão de topo). Nenhuma biblioteca externa.

**Tech Stack:** CSS nativo, JS vanilla, HTML5.

---

## Auditoria de Motion

### Animações de entrada (`@keyframes fadeUp`) — seletores afetados
| Seletor | Uso |
|---|---|
| `.arvore` | `animation: fadeUp .4s` |
| `.hero` | `animation: fadeUp .45s` |
| `.cards-turmas` | `animation: fadeUp .35s` |
| `.cards-temas` | `animation: fadeUp .35s` |
| `.materias-cards` | `animation: fadeUp .35s` |
| `#conteudo-area` | `animation: fadeUp .3s` |
| `.flash-sessao` | `animation: fadeUp .3s` |
| `.flash-resumo` | `animation: fadeUp .3s` |

### Skeleton shimmer (`@keyframes sk-shimmer`)
| Seletor | Uso |
|---|---|
| `.sk` | `animation: sk-shimmer 1.5s infinite` |
| `.sk-inv` | `animation: sk-shimmer 1.5s infinite` |

### Transições com `transform` (movimento)
| Seletor | Transform animado |
|---|---|
| `.no-tema:hover` | `translateX(3px)` |
| `.no-tema::before` | `left .18s` (desloca indicador) |
| `.card-turma:hover` | `translateY(-2px)` |
| `.card-tema:hover` | `translateY(-3px)` |
| `.card-materia:hover` | `translateY(-2px)` |
| `.card-materia:active` | `translateY(0)` |
| `.flash-card:active` | `scale(.98)` |
| `#btn-topo` | `translateY(12px)` → `translateY(0)` |
| `.skip-link` | `top: -40px` → `top: 0` (via transition: top) |

### Transições só visuais (mantidas mesmo com reduce)
`.btn-sobre`, `#breadcrumb .crumb`, `.turma-tab`, `.card-tema::after`, `.flash-btn`, `.flash-resumo-btn`, `.flash-btn-deletar`, `#busca-btn`, `.busca-resultado`

### Scroll programático em JS
| Local | Código atual |
|---|---|
| `app.js` âncoras internas | `window.scrollTo({ top, behavior: 'smooth' })` |
| `rolarParaAncora()` | já usa `matchMedia` ✓ |
| `index.html` / `404.html` btn-topo | `onclick="window.scrollTo({top:0,behavior:'smooth'})"` |

### Killswitch global a remover (2 ocorrências em style.css)
- Linhas 1248-1254: `@media (prefers-reduced-motion: reduce) { *, *::before, *::after { animation-duration: .01ms !important; ... } }`
- Linhas 1383-1390: duplicata idêntica

---

## Task 1 — Remover killswitch global e ajustar @keyframes

**Files:**
- Modify: `style.css` (remover blocos killswitch, criar versões reduzidas dos keyframes)

- [ ] **Step 1: Remover os dois blocos killswitch**

Localizar e deletar ambos os blocos abaixo (existem em dois lugares, linhas ~1248 e ~1383):
```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
```
Substituir o SEGUNDO (o que fica ao final do arquivo, perto de `:focus-visible`) por apenas o `scroll-behavior` no `html`:
```css
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}
```
O primeiro bloco (linha ~1248) pode ser simplesmente deletado.

- [ ] **Step 2: Adicionar versão reduzida de `@keyframes fadeUp`**

Logo após o bloco existente de `@keyframes fadeUp`:
```css
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(14px); }
  to   { opacity: 1; transform: translateY(0); }
}
```
Adicionar:
```css
@media (prefers-reduced-motion: reduce) {
  @keyframes fadeUp {
    from { opacity: 0; }
    to   { opacity: 1; }
  }
}
```

- [ ] **Step 3: Adicionar versão reduzida de `@keyframes sk-shimmer`**

Logo após o bloco existente de `@keyframes sk-shimmer`:
```css
@keyframes sk-shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
```
Adicionar:
```css
@media (prefers-reduced-motion: reduce) {
  @keyframes sk-shimmer {
    0%, 100% { background-position: 0 0; }
  }
  .sk, .sk-inv { animation-duration: 3s; }
}
```
_(Mantém shimmer levíssimo — sem deslocamento horizontal — como feedback de carregamento. Alternativa: substituir por `opacity: .6` pulsando, mas o shimmer parado é suficiente.)_

- [ ] **Step 4: Commit**
```bash
git add style.css
git commit -m "a11y(motion): remove killswitch global e cria keyframes reduzidos"
```

---

## Task 2 — Cards de matéria, turma e tema

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Cards de matéria**

Após o bloco `.card-materia:active { ... }`, adicionar:
```css
@media (prefers-reduced-motion: reduce) {
  .card-materia {
    transition: box-shadow .2s, border-color .18s;
  }
  .card-materia:hover {
    transform: none;
  }
  .card-materia:active {
    transform: none;
  }
}
```

- [ ] **Step 2: Cards de turma**

Após `.card-turma:hover { ... }`, adicionar:
```css
@media (prefers-reduced-motion: reduce) {
  .card-turma {
    transition: background .18s, box-shadow .18s;
  }
  .card-turma:hover {
    transform: none;
  }
}
```

- [ ] **Step 3: Cards de tema**

Após `.card-tema:hover::after { opacity: 1; }`, adicionar:
```css
@media (prefers-reduced-motion: reduce) {
  .card-tema {
    transition: box-shadow .18s, border-color .18s;
  }
  .card-tema:hover {
    transform: none;
  }
}
```

- [ ] **Step 4: Commit**
```bash
git add style.css
git commit -m "a11y(motion): respeita prefers-reduced-motion nos cards de matéria, turma e tema"
```

---

## Task 3 — Nós da árvore e botão de topo

**Files:**
- Modify: `style.css`

- [ ] **Step 1: `.no-tema` (translateX + left)**

Após `.no-tema:hover::before { opacity: 1; left: 11px; }`, adicionar:
```css
@media (prefers-reduced-motion: reduce) {
  .no-tema {
    transition: background .18s, border-color .18s, box-shadow .18s;
  }
  .no-tema:hover {
    transform: none;
  }
  .no-tema::before {
    transition: opacity .18s;
  }
}
```

- [ ] **Step 2: `#btn-topo` (translateY)**

O botão usa `transform: translateY(12px)` no estado oculto e `translateY(0)` no visível. Com reduced-motion, removemos o transform e usamos só opacidade:
```css
@media (prefers-reduced-motion: reduce) {
  #btn-topo {
    transform: none;
    transition: opacity .22s, background .18s;
  }
  #btn-topo.visivel {
    transform: none;
  }
}
```

- [ ] **Step 3: `.skip-link` (transition: top)**

Após `.skip-link:focus-visible { ... }`, adicionar:
```css
@media (prefers-reduced-motion: reduce) {
  .skip-link {
    transition: none;
  }
}
```
_(O skip link ainda aparece ao focar — só não desliza suavemente.)_

- [ ] **Step 4: `.flash-card:active` (scale)**

Após `.flash-card:active { transform: scale(.98); }`, adicionar:
```css
@media (prefers-reduced-motion: reduce) {
  .flash-card {
    transition: none;
  }
  .flash-card:active {
    transform: none;
  }
}
```

- [ ] **Step 5: Commit**
```bash
git add style.css
git commit -m "a11y(motion): respeita prefers-reduced-motion em no-tema, btn-topo, skip-link e flash-card"
```

---

## Task 4 — Scroll programático em JS e HTML

**Files:**
- Modify: `app.js`
- Modify: `index.html`
- Modify: `404.html`

- [ ] **Step 1: Adicionar utilitário `scrollSuave` em `app.js`**

No topo de `app.js`, logo antes da linha `// ── Skeleton loaders`, adicionar:
```js
function scrollSuave(el, opts = {}) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start', ...opts })
}
```

- [ ] **Step 2: Substituir scroll com `behavior: 'smooth'` em âncoras internas**

Em `abrirTema`, localizar:
```js
window.scrollTo({ top, behavior: 'smooth' })
```
Substituir por:
```js
const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
```

- [ ] **Step 3: Corrigir btn-topo em `index.html`**

Localizar:
```html
<button id="btn-topo" title="Voltar ao topo" aria-label="Voltar ao topo" onclick="window.scrollTo({top:0,behavior:'smooth'})">↑</button>
```
Substituir por:
```html
<button id="btn-topo" title="Voltar ao topo" aria-label="Voltar ao topo" onclick="window.scrollTo({top:0,behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'})">↑</button>
```

- [ ] **Step 4: Mesmo ajuste em `404.html`**

Localizar e substituir idêntico ao Step 3.

- [ ] **Step 5: Commit**
```bash
git add app.js index.html 404.html
git commit -m "a11y(motion): adapta scroll programático a prefers-reduced-motion"
```

---

## Task 5 — Criar `AUDITORIA-MOTION.md` e abrir o PR

**Files:**
- Create: `AUDITORIA-MOTION.md`

- [ ] **Step 1: Criar o arquivo de documentação**

Criar `AUDITORIA-MOTION.md` na raiz com o conteúdo da seção "Auditoria de Motion" deste plano, mais a confirmação de que o killswitch global **não** foi utilizado.

- [ ] **Step 2: Commit**
```bash
git add AUDITORIA-MOTION.md
git commit -m "docs(a11y): adiciona AUDITORIA-MOTION.md com mapeamento de animações"
```

- [ ] **Step 3: Push e criar PR**
```bash
git push origin HEAD
gh pr create \
  --title "a11y: suporte a prefers-reduced-motion (abordagem caso a caso)" \
  --body "$(cat <<'EOF'
## Seletores / animações tratados

### Keyframes reduzidos
- `@keyframes fadeUp` → versão reduce: só `opacity` (sem `translateY`)
- `@keyframes sk-shimmer` → versão reduce: posição fixa (sem deslocamento horizontal)

### Transições com transform removido
- `.card-materia:hover` — `translateY(-2px)` → `none`; mantém `box-shadow` e `border-color`
- `.card-turma:hover` — `translateY(-2px)` → `none`; mantém `box-shadow`
- `.card-tema:hover` — `translateY(-3px)` → `none`; mantém `box-shadow` e `border-color`
- `.no-tema:hover` — `translateX(3px)` → `none`; mantém `background` e `border-color`
- `.no-tema::before` — `left .18s` → removido; mantém `opacity`
- `.flash-card:active` — `scale(.98)` → `none`
- `#btn-topo` — `translateY(12px→0)` → `none`; mantém `opacity`
- `.skip-link` — `transition: top` → `none`

### Scroll programático adaptado
- `app.js` âncoras internas (`abrirTema`) — `behavior: 'smooth'` → detecta `matchMedia`
- `rolarParaAncora()` — já usava `matchMedia` ✓
- `index.html` / `404.html` btn-topo — `behavior: 'smooth'` → detecta `matchMedia`

## Confirmação
**O killswitch global (`* { animation: none !important; transition: none !important; }`) NÃO foi utilizado.**
Os dois blocos kill anteriores foram removidos e substituídos por regras caso a caso.

## Como testar
1. DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce`
2. Hover nos cards: sombra muda, card NÃO sobe
3. Scroll para âncora: instantâneo
4. Entradas de seção: fade sem deslocamento
5. Alternar para `no-preference`: animações voltam normalmente

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

---

## Self-Review

### Cobertura da spec
- [x] Auditar `style.css` → Task 1-3 + `AUDITORIA-MOTION.md`
- [x] Versão reduzida caso a caso → Tasks 2 e 3
- [x] `scroll-behavior: auto` para `html` → Task 1 Step 1
- [x] Scroll programático com `matchMedia` → Task 4
- [x] `@keyframes` versão fade-only → Task 1 Step 2-3
- [x] Sem bibliotecas externas → ✓ tudo CSS/JS vanilla
- [x] Não alterar experiência padrão → as media queries só afetam `reduce`
- [x] PR com descrição completa → Task 5 Step 3

### Killswitch global
Removido em Task 1 Step 1. Confirmado na AUDITORIA-MOTION.md.
