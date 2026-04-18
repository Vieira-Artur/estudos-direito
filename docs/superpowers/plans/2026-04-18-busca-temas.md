# Busca de Temas — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar campo de busca full-text ao site estudos-direito: lupa no header que expande inline, indexa os HTMLs de tema via fetch lazy e exibe resultados em painel abaixo do header.

**Architecture:** Lupa 🔍 no header → primeira abertura faz `Promise.all(fetch)` de todos os arquivos de tema, parseia via `DOMParser` e salva em `window._searchIndex[]`. Busca as-you-type (debounce 200 ms) varre o índice com lógica AND + pontuação, renderiza painel de resultados dentro do `<header>` (que já é sticky). Navegação usa `abrirTemaDaArvore()` já existente em `app.js`.

**Tech Stack:** Vanilla JS ES2020, HTML5, CSS custom properties. Sem dependências externas.

---

## Mapa de arquivos

| Arquivo | Operação | O que muda |
|---|---|---|
| `style.css` | Modify | Estilos: `#busca-btn`, `#busca-input-wrap`, `#busca-input`, `#busca-painel`, `.busca-resultado*`, `mark`, mobile |
| `index.html` | Modify | `.header-top`: envolve `.btn-sobre` + novo `#busca-btn` em `.header-acoes`; adiciona `#busca-painel` dentro do `<header>` |
| `app.js` | Modify | Módulo de busca no final do arquivo: `indexarConteudo`, `buscar`, `renderResultados`, `navegarParaResultado`, `abrirBusca`, `fecharBusca`, helpers `_normalizar`, `_snippetComMark`, `_onBuscaInput`, `_onEscBusca` |

---

## Task 1: CSS — estilos da busca

**Files:**
- Modify: `style.css` (final do arquivo, antes do bloco `@media print`)

- [ ] **Step 1: Adicionar estilos**

Localize o comentário `/* ── Print ── */` em `style.css` e insira o bloco abaixo **imediatamente antes** dele:

```css
/* ── Busca ── */
.header-acoes {
  display: flex;
  align-items: center;
  gap: 10px;
}

#busca-btn {
  background: rgba(255,255,255,.15);
  border: 1px solid rgba(255,255,255,.35);
  border-radius: 6px;
  color: white;
  width: 32px;
  height: 32px;
  font-size: 16px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background .15s;
}
#busca-btn:hover { background: rgba(255,255,255,.25); }

#busca-input-wrap {
  display: flex;
  align-items: center;
  gap: 6px;
}
#busca-input-wrap[hidden] { display: none; }

#busca-input {
  background: rgba(255,255,255,.18);
  border: 1px solid rgba(255,255,255,.5);
  border-radius: 6px;
  color: white;
  padding: 5px 12px;
  width: 220px;
  font-size: 13px;
  font-family: var(--sans);
}
#busca-input::placeholder { color: rgba(255,255,255,.6); }
#busca-input:disabled { opacity: .6; cursor: wait; }
#busca-input:focus-visible { outline: 2px solid var(--blue-accent); outline-offset: 2px; }

#busca-fechar {
  background: transparent;
  border: none;
  color: rgba(255,255,255,.85);
  font-size: 20px;
  cursor: pointer;
  padding: 0 4px;
  line-height: 1;
}

/* Painel dentro do header — bleed até as bordas */
#busca-painel {
  margin: 8px -28px -14px;
  padding: 10px 28px 14px;
  background: #eef2f8;
  border-top: 1px solid rgba(255,255,255,.12);
}
#busca-painel[hidden] { display: none; }

.busca-count {
  font-family: var(--sans);
  font-size: 12px;
  color: var(--text2);
  margin-bottom: 8px;
}

.busca-resultados {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.busca-resultado {
  background: white;
  border-radius: 6px;
  padding: 9px 12px;
  border-left: 3px solid var(--blue);
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
  transition: box-shadow .12s;
}
.busca-resultado:hover { box-shadow: 0 2px 8px rgba(31,73,125,.15); }

.busca-resultado-corpo { flex: 1; min-width: 0; }

.busca-resultado-materia {
  font-family: var(--sans);
  font-size: 10px;
  font-weight: 700;
  color: var(--blue);
  letter-spacing: .06em;
  text-transform: uppercase;
  margin-bottom: 2px;
}

.busca-resultado-titulo {
  font-family: var(--sans);
  font-weight: 600;
  font-size: 13px;
  color: var(--text);
  margin-bottom: 3px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.busca-resultado-snippet {
  font-family: var(--sans);
  font-size: 11px;
  color: var(--text2);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.busca-resultado-snippet mark {
  background: #fff3cd;
  border-radius: 2px;
  padding: 0 2px;
  font-style: normal;
  color: inherit;
}

.busca-resultado-seta {
  color: var(--blue);
  font-size: 16px;
  flex-shrink: 0;
}

#app.busca-ativa { opacity: .45; pointer-events: none; }

.busca-vazio {
  font-family: var(--sans);
  font-size: 13px;
  color: var(--text2);
  text-align: center;
  padding: 4px 0;
}

@media (max-width: 480px) {
  #busca-painel { margin: 8px -14px -10px; padding: 10px 14px; }
  #busca-input  { width: 150px; font-size: 12px; }
}
```

- [ ] **Step 2: Verificar CSS**

Abra `style.css` e confirme que o bloco foi inserido antes de `/* ── Print ── */`. Nenhum erro de sintaxe visível.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "style: adiciona estilos do módulo de busca"
```

---

## Task 2: HTML — botão e painel

**Files:**
- Modify: `index.html` linhas 26–29

- [ ] **Step 1: Atualizar `.header-top`**

Substitua o trecho atual do `.header-top` (que tem só o link `.btn-sobre`) por:

```html
    <div class="header-top">
      <div class="site-titulo">
        <span class="site-titulo-full">Estudos Complementares — Prof. Artur Vieira</span>
        <span class="site-titulo-short">Estudos Complementares</span>
      </div>
      <div class="header-acoes">
        <a href="#" class="btn-sobre" onclick="abrirSobre(); return false;">Sobre mim</a>
        <button id="busca-btn" aria-label="Buscar tema" onclick="abrirBusca()">🔍</button>
        <div id="busca-input-wrap" hidden>
          <input id="busca-input" type="search" aria-label="Buscar tema"
                 placeholder="Buscar tema…" autocomplete="off">
          <button id="busca-fechar" aria-label="Fechar busca" onclick="fecharBusca()">✕</button>
        </div>
      </div>
    </div>
```

- [ ] **Step 2: Adicionar `#busca-painel` dentro do `<header>`**

Logo antes de `</header>`, adicione:

```html
    <div id="busca-painel" aria-live="polite" hidden></div>
```

O `<header>` completo deve ficar:

```html
  <header>
    <div class="header-top">
      <div class="site-titulo">
        <span class="site-titulo-full">Estudos Complementares — Prof. Artur Vieira</span>
        <span class="site-titulo-short">Estudos Complementares</span>
      </div>
      <div class="header-acoes">
        <a href="#" class="btn-sobre" onclick="abrirSobre(); return false;">Sobre mim</a>
        <button id="busca-btn" aria-label="Buscar tema" onclick="abrirBusca()">🔍</button>
        <div id="busca-input-wrap" hidden>
          <input id="busca-input" type="search" aria-label="Buscar tema"
                 placeholder="Buscar tema…" autocomplete="off">
          <button id="busca-fechar" aria-label="Fechar busca" onclick="fecharBusca()">✕</button>
        </div>
      </div>
    </div>
    <nav id="breadcrumb"></nav>
    <div id="busca-painel" aria-live="polite" hidden></div>
  </header>
```

- [ ] **Step 3: Verificar no browser**

Sirva localmente (`npx serve . --listen 8099`) e abra `http://localhost:8099`. O botão 🔍 deve aparecer à direita do link "Sobre mim". Clicar nele ainda não faz nada (JS ainda não foi adicionado).

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "feat: adiciona botão busca e painel ao header"
```

---

## Task 3: app.js — módulo de busca

**Files:**
- Modify: `app.js` (final do arquivo, após a função `abrirSobre`)

- [ ] **Step 1: Adicionar módulo completo**

Ao final de `app.js` (após a última função existente), adicione o bloco abaixo integralmente:

```js
// ── Busca ──────────────────────────────────────────────

window._searchIndex = null   // null = não indexado; [] = indexado (pode ser vazio)

async function indexarConteudo() {
  const entradas = []
  for (const mat of materias) {
    for (const turma of mat.turmas) {
      turma.temas.forEach((tema, i) => {
        entradas.push({
          titulo:    tema.titulo,
          materia:   mat.titulo,
          materiaId: mat.id,
          turmaId:   turma.id,
          temaIdx:   i,
          arquivo:   tema.arquivo,
        })
      })
    }
  }

  const parser = new DOMParser()
  window._searchIndex = await Promise.all(
    entradas.map(async entrada => {
      try {
        const r = await fetch(entrada.arquivo)
        if (!r.ok) throw new Error('not found')
        const html = await r.text()
        const doc  = parser.parseFromString(html, 'text/html')
        doc.querySelectorAll('script, style').forEach(el => el.remove())
        entrada.texto = doc.body.textContent.replace(/\s+/g, ' ').trim()
      } catch {
        entrada.texto = ''
      }
      return entrada
    })
  )
}

function _normalizar(str) {
  return str.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function _snippetComMark(texto, palavras, raio = 60) {
  const norm   = _normalizar(texto)
  const idx    = norm.indexOf(palavras[0])
  if (idx === -1) return ''
  const inicio = Math.max(0, idx - raio)
  const fim    = Math.min(texto.length, idx + raio + palavras[0].length)
  // Escapa HTML do trecho antes de inserir <mark>
  let trecho = esc(
    (inicio > 0 ? '…' : '') + texto.slice(inicio, fim) + (fim < texto.length ? '…' : '')
  )
  palavras.forEach(p => {
    const re = new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi')
    trecho = trecho.replace(re, m => `<mark>${m}</mark>`)
  })
  return trecho
}

function buscar(termo) {
  if (!window._searchIndex || !termo) return []
  const palavras = _normalizar(termo).split(/\s+/).filter(Boolean)
  if (!palavras.length) return []

  const scored = []
  for (const entrada of window._searchIndex) {
    const nt = _normalizar(entrada.titulo)
    const nx = _normalizar(entrada.texto)
    if (!palavras.every(p => nt.includes(p) || nx.includes(p))) continue

    let score = 0
    palavras.forEach(p => {
      if (nt.includes(p)) score += 10
      const m = nx.match(new RegExp(p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))
      score += Math.min(5, (m || []).length)
    })
    scored.push({ ...entrada, score, snippet: _snippetComMark(entrada.texto, palavras) })
  }
  return scored.sort((a, b) => b.score - a.score).slice(0, 6)
}

function renderResultados(resultados, termo) {
  const painel = document.getElementById('busca-painel')
  if (!resultados.length) {
    painel.innerHTML = `<p class="busca-vazio">Nenhum resultado para <strong>"${esc(termo)}"</strong>.</p>`
  } else {
    const label = resultados.length === 1 ? 'resultado' : 'resultados'
    painel.innerHTML = `
      <p class="busca-count">${resultados.length} ${label} para <strong>"${esc(termo)}"</strong></p>
      <div class="busca-resultados">
        ${resultados.map(r => `
          <div class="busca-resultado"
               role="button" tabindex="0"
               aria-label="${esc(r.titulo)}, ${esc(r.materia)}"
               onclick="navegarParaResultado('${esc(r.materiaId)}','${esc(r.turmaId)}',${r.temaIdx})"
               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();navegarParaResultado('${esc(r.materiaId)}','${esc(r.turmaId)}',${r.temaIdx})}">
            <div class="busca-resultado-corpo">
              <div class="busca-resultado-materia">${esc(r.materia)}</div>
              <div class="busca-resultado-titulo">${esc(r.titulo)}</div>
              ${r.snippet ? `<div class="busca-resultado-snippet">${r.snippet}</div>` : ''}
            </div>
            <span class="busca-resultado-seta" aria-hidden="true">›</span>
          </div>
        `).join('')}
      </div>`
  }
  painel.removeAttribute('hidden')
  document.getElementById('app').classList.add('busca-ativa')
}

function navegarParaResultado(materiaId, turmaId, temaIdx) {
  fecharBusca()
  abrirTemaDaArvore(materiaId, turmaId, temaIdx)
}

let _buscaTimer = null

function _onBuscaInput(e) {
  clearTimeout(_buscaTimer)
  const termo = e.target.value.trim()
  const painel = document.getElementById('busca-painel')
  if (termo.length < 2) {
    painel.setAttribute('hidden', '')
    painel.innerHTML = ''
    document.getElementById('app').classList.remove('busca-ativa')
    return
  }
  _buscaTimer = setTimeout(() => renderResultados(buscar(termo), termo), 200)
}

function _onEscBusca(e) {
  if (e.key === 'Escape') fecharBusca()
}

async function abrirBusca() {
  const btn   = document.getElementById('busca-btn')
  const wrap  = document.getElementById('busca-input-wrap')
  const input = document.getElementById('busca-input')

  btn.setAttribute('hidden', '')
  wrap.removeAttribute('hidden')
  input.disabled    = true
  input.placeholder = '⏳ Indexando conteúdo…'

  if (!window._searchIndex) await indexarConteudo()

  input.disabled    = false
  input.placeholder = 'Buscar tema…'
  input.focus()
  input.addEventListener('input', _onBuscaInput)
  document.addEventListener('keydown', _onEscBusca)
}

function fecharBusca() {
  const btn    = document.getElementById('busca-btn')
  const wrap   = document.getElementById('busca-input-wrap')
  const input  = document.getElementById('busca-input')
  const painel = document.getElementById('busca-painel')

  input.removeEventListener('input', _onBuscaInput)
  document.removeEventListener('keydown', _onEscBusca)
  clearTimeout(_buscaTimer)

  input.value = ''
  wrap.setAttribute('hidden', '')
  btn.removeAttribute('hidden')
  painel.setAttribute('hidden', '')
  painel.innerHTML = ''
  document.getElementById('app').classList.remove('busca-ativa')
}
```

- [ ] **Step 2: Commit**

```bash
git add app.js
git commit -m "feat: módulo de busca full-text (fetch lazy + painel no header)"
```

---

## Task 4: Verificação manual

**Files:** nenhum (só leitura no browser)

- [ ] **Step 1: Subir servidor e abrir o site**

```bash
npx serve . --listen 8099
```

Abra `http://localhost:8099`.

- [ ] **Step 2: Verificar estado de repouso**

O botão 🔍 aparece à direita de "Sobre mim" no header. Deve ter bordas suaves e leve transparência. Nenhum painel visível abaixo.

- [ ] **Step 3: Verificar estado indexando**

Clique em 🔍. O botão some, o campo aparece **desabilitado** com placeholder `⏳ Indexando conteúdo…` por ~400 ms. Em seguida o campo fica habilitado com placeholder `Buscar tema…` e recebe foco automático.

- [ ] **Step 4: Verificar busca com resultado**

Digite `flagrante`. Após ~200 ms o painel aparece abaixo do header com cards mostrando:
- Label da matéria em azul uppercase
- Título do tema em negrito
- Snippet com `flagrante` destacado em amarelo (`#fff3cd`)
- O conteúdo ao fundo fica com opacidade reduzida

- [ ] **Step 5: Verificar navegação por resultado**

Clique em um card de resultado. O painel fecha, o campo some, o 🔍 volta e a SPA navega para o tema correto (breadcrumb atualiza, conteúdo do tema é carregado).

- [ ] **Step 6: Verificar estado vazio**

Limpe o campo e digite `xyzabcdef`. O painel deve exibir `Nenhum resultado para "xyzabcdef".`

- [ ] **Step 7: Verificar fechar com Esc**

Com o campo aberto e resultados visíveis, pressione `Esc`. O campo fecha, painel some, 🔍 reaparece.

- [ ] **Step 8: Verificar que redigitar não duplica listeners**

Abra e feche a busca três vezes, depois busque. O painel deve mostrar cada resultado **uma única vez** (sem duplicatas que indicariam listeners acumulados).

- [ ] **Step 9: Verificar acessibilidade via teclado**

Pressione `Tab` até chegar no botão 🔍, `Enter` para abrir, digite um termo, `Tab` para mover foco para os resultados, `Enter` em um resultado para navegar.

- [ ] **Step 10: Commit final**

```bash
git add -A
git commit -m "chore: verifica busca de temas — todos os cenários ok"
```

---

## Self-review

**Cobertura do spec:**

| Requisito spec | Task |
|---|---|
| Lupa 🔍 no header, expande inline | T2 + T3 (`abrirBusca`) |
| Fetch lazy na primeira abertura | T3 (`indexarConteudo`) |
| Índice `window._searchIndex[]` | T3 |
| As-you-type ≥2 chars, debounce 200 ms | T3 (`_onBuscaInput`) |
| AND de palavras, score título > corpo | T3 (`buscar`) |
| Snippet ±60 chars com `<mark>` | T3 (`_snippetComMark`) |
| Painel `#eef2f8`, borda `2px solid #1F497D` | T1 (CSS) |
| Cards: label · título · snippet · seta | T3 (`renderResultados`) |
| Navegação via `abrirTemaDaArvore` | T3 (`navegarParaResultado`) |
| Fechar com Esc | T3 (`_onEscBusca`) |
| `aria-live="polite"` no painel | T2 |
| `role="button"` + `tabindex` + `onkeydown` nos resultados | T3 |
| Estado vazio | T3 (`renderResultados`) |
| Estado indexando (spinner) | T3 (`abrirBusca`) |
| Mobile (width 150px, margin ajustado) | T1 (CSS `@media`) |

**Sem placeholders:** todo o código está completo.

**Consistência de nomes:**
- `_snippetComMark` usada em `buscar` ✓
- `navegarParaResultado` usada em `renderResultados` (onclick/onkeydown) ✓
- `abrirTemaDaArvore` já existe em `app.js` (linha 468) ✓
- `_onBuscaInput` registrada em `abrirBusca`, removida em `fecharBusca` ✓
- `_onEscBusca` registrada em `abrirBusca`, removida em `fecharBusca` ✓
