# Meu Espaço — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar aba "Meu Espaço" em cada tema do site com editor de texto rico e canvas de diagramas (Mapa Mental, Linha do Tempo, Canvas Livre), tudo persistido no localStorage do aluno.

**Architecture:** Dois arquivos novos (`meu-espaco.js`, `meu-espaco.css`) carregados no `index.html`. O `app.js` chama `MeuEspaco.init(area, arquivo)` após injetar cada tema. A aba se integra ao sistema de tabs `.fp-tab`/`.fp-painel` já existente em cada página de tema. Diagramas usam Fabric.js carregado por CDN sob demanda.

**Tech Stack:** HTML/CSS/JS puro, Fabric.js 5.3.0 via CDN, localStorage.

---

## File Map

| Ação | Arquivo | Responsabilidade |
|------|---------|-----------------|
| Criar | `meu-espaco.css` | Todos os estilos da área |
| Criar | `meu-espaco.js` | Toda a lógica: injeção de aba, editor, canvases, auto-save |
| Modificar | `index.html` | Adicionar `<link>` e `<script>` |
| Modificar | `app.js` | Chamar `MeuEspaco.init` em `abrirTema` |

---

## Task 1: CSS + wiring no index.html

**Files:**
- Create: `meu-espaco.css`
- Modify: `index.html` (linha 16 — após `style.css`)

- [ ] **Step 1: Criar `meu-espaco.css`**

```css
/* ── Aba externa (botão dourado na barra fp-tabs) ─────── */
.me-tab-btn {
  border-color: var(--gold) !important;
  color: var(--gold) !important;
}
.me-tab-btn:hover { background: var(--gold-light) !important; }
.me-tab-btn.ativo {
  background: var(--gold) !important;
  color: #fff !important;
  border-color: var(--gold) !important;
}

/* ── Abas internas (Anotações | Diagrama) ─────────────── */
.me-inner-tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
  margin-bottom: 0;
}
.me-itab {
  padding: 7px 18px;
  font-size: 13px; font-weight: 600; font-family: var(--sans);
  background: none; border: none;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer; color: var(--text2);
  transition: color .15s, border-color .15s;
}
.me-itab:hover { color: var(--blue); }
.me-itab.ativo { color: var(--blue); border-bottom-color: var(--blue); }

/* ── Painéis internos ─────────────────────────────────── */
.me-ipainel { display: none; padding: 14px 0 0; }
.me-ipainel.ativo { display: block; }

/* ── Toolbar do editor de texto ───────────────────────── */
.me-toolbar {
  display: flex; gap: 4px;
  padding: 0 0 8px; flex-wrap: wrap; align-items: center;
}
.me-tbtn {
  padding: 3px 10px; font-size: 13px;
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 4px; cursor: pointer; color: var(--text);
  font-family: var(--sans); transition: background .1s;
}
.me-tbtn:hover { background: var(--blue-hover); }
.me-salvo {
  font-size: 11px; color: var(--text2);
  margin-left: 6px; font-family: var(--sans); opacity: .7;
}

/* ── Editor contenteditable ───────────────────────────── */
.me-editor {
  min-height: 120px; padding: 10px 12px;
  border: 1px solid var(--border); border-radius: 6px;
  font-size: 14px; font-family: var(--serif); line-height: 1.7;
  color: var(--text); background: var(--surface);
  outline: none; transition: border-color .15s;
}
.me-editor:focus { border-color: var(--blue); }
.me-editor:empty::before {
  content: attr(data-placeholder);
  color: var(--text2); pointer-events: none;
}
.me-flow-arrow { color: var(--blue); font-size: 1.1em; margin: 0 2px; }

/* ── Botão apagar ─────────────────────────────────────── */
.me-apagar-btn {
  margin-top: 12px; padding: 5px 12px; font-size: 12px;
  background: none; border: 1px solid #c0392b;
  border-radius: 4px; color: #c0392b; cursor: pointer;
  font-family: var(--sans); transition: background .1s;
}
.me-apagar-btn:hover { background: #fde8e8; }

/* ── Sub-abas de diagrama ─────────────────────────────── */
.me-sub-tabs {
  display: flex; gap: 4px;
  padding: 12px 0 8px; flex-wrap: wrap;
}
.me-stab {
  padding: 4px 12px; font-size: 12px; font-weight: 600;
  font-family: var(--sans); background: var(--surface);
  border: 1px solid var(--border); border-radius: 12px;
  cursor: pointer; color: var(--text2); transition: background .1s, color .1s;
}
.me-stab:hover { background: var(--blue-hover); color: var(--blue); }
.me-stab.ativo { background: var(--blue); color: #fff; border-color: var(--blue); }

/* ── Sub-painéis ──────────────────────────────────────── */
.me-sub-painel { display: none; }
.me-sub-painel.ativo { display: block; }

/* ── Dica abaixo do canvas ────────────────────────────── */
.me-canvas-hint {
  font-size: 11px; color: var(--text2);
  font-family: var(--sans); margin-top: 5px;
  text-align: center;
}

/* ── Toolbar de formas (canvas livre) ─────────────────── */
.me-shape-toolbar {
  display: flex; gap: 4px;
  padding: 0 0 6px; flex-wrap: wrap;
}
.me-sbtn {
  padding: 4px 10px; font-size: 12px; font-family: var(--sans);
  background: var(--surface); border: 1px solid var(--border);
  border-radius: 4px; cursor: pointer; color: var(--text);
  transition: background .1s;
}
.me-sbtn:hover { background: var(--blue-hover); }
.me-sbtn.ativo { background: var(--blue); color: #fff; border-color: var(--blue); }

/* ── Fabric.js canvas border override ─────────────────── */
.canvas-container { border: 1px solid var(--border); border-radius: 6px; overflow: hidden; }
```

- [ ] **Step 2: Adicionar `<link>` e `<script>` no `index.html`**

Em `index.html`, linha 16, após `<link rel="stylesheet" href="style.css">`, adicionar:
```html
  <link rel="stylesheet" href="meu-espaco.css">
```

Em `index.html`, linha 49, após `<script src="data.js"></script>`, adicionar:
```html
  <script src="meu-espaco.js"></script>
```

O bloco final de scripts deve ficar:
```html
  <script src="data.js"></script>
  <script src="meu-espaco.js"></script>
  <script src="app.js"></script>
```

- [ ] **Step 3: Verificar no navegador**

Abra o site localmente (`open index.html` ou servidor local). Não deve haver erros de console. Ainda não há aba "Meu Espaço" visível — isso é esperado; o arquivo `meu-espaco.js` ainda não existe.

- [ ] **Step 4: Commit**

```bash
git add meu-espaco.css index.html
git commit -m "feat: add meu-espaco.css styles and wire assets into index.html"
```

---

## Task 2: Scaffold do meu-espaco.js + injeção da aba

**Files:**
- Create: `meu-espaco.js`

- [ ] **Step 1: Criar `meu-espaco.js` com scaffold + injeção de aba**

```js
const MeuEspaco = (() => {
  const FABRIC_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js'

  function storageKey(tipo, arquivo) {
    return `meu-espaco-${tipo}:${arquivo}`
  }

  function debounce(fn, ms) {
    let t
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
  }

  function loadFabric(cb) {
    if (window.fabric) return cb()
    let s = document.getElementById('me-fabric-script')
    if (s) { s.addEventListener('load', cb); return }
    s = document.createElement('script')
    s.id = 'me-fabric-script'
    s.src = FABRIC_CDN
    s.onload = cb
    document.head.appendChild(s)
  }

  function renderPainel() {
    return `
      <div class="me-inner-tabs">
        <button class="me-itab ativo" data-me-tab="anotacoes">Anotações</button>
        <button class="me-itab" data-me-tab="diagrama">Diagrama</button>
      </div>
      <div class="me-ipainel ativo" data-me-painel="anotacoes">
        <div class="me-toolbar">
          <button class="me-tbtn" data-cmd="bold"><b>B</b></button>
          <button class="me-tbtn" data-cmd="italic"><i>I</i></button>
          <button class="me-tbtn" data-cmd="underline"><u>U</u></button>
          <button class="me-tbtn" data-cmd="seta">→ Fluxo</button>
          <span class="me-salvo" aria-live="polite"></span>
        </div>
        <div class="me-editor" contenteditable="true" spellcheck="true"
             data-placeholder="Suas anotações sobre este tema..."></div>
        <button class="me-apagar-btn">🗑 Apagar tudo deste tema</button>
      </div>
      <div class="me-ipainel" data-me-painel="diagrama">
        <div class="me-sub-tabs">
          <button class="me-stab ativo" data-me-stab="mapa-mental">🧠 Mapa Mental</button>
          <button class="me-stab" data-me-stab="linha-do-tempo">📅 Linha do Tempo</button>
          <button class="me-stab" data-me-stab="canvas-livre">🎨 Canvas Livre</button>
        </div>
        <div class="me-sub-painel ativo" data-me-spanel="mapa-mental">
          <canvas id="me-canvas-mapa"></canvas>
          <p class="me-canvas-hint">Clique para adicionar nó · Shift+clique em dois nós para conectar · Duplo-clique para editar</p>
        </div>
        <div class="me-sub-painel" data-me-spanel="linha-do-tempo">
          <canvas id="me-canvas-linha"></canvas>
          <p class="me-canvas-hint">Clique na linha para adicionar evento · Arraste para mover</p>
        </div>
        <div class="me-sub-painel" data-me-spanel="canvas-livre">
          <div class="me-shape-toolbar">
            <button class="me-sbtn ativo" data-shape="caixa">□ Caixa</button>
            <button class="me-sbtn" data-shape="circulo">○ Círculo</button>
            <button class="me-sbtn" data-shape="seta">→ Seta</button>
            <button class="me-sbtn" data-shape="texto">T Texto</button>
          </div>
          <canvas id="me-canvas-livre"></canvas>
          <p class="me-canvas-hint">Clique no canvas para inserir · Arraste para mover</p>
        </div>
      </div>
    `
  }

  function init(area, arquivo) {
    const tabsBar = area.querySelector('.fp-tabs')
    if (!tabsBar) return

    // Criar botão da aba
    const btn = document.createElement('button')
    btn.className = 'fp-tab me-tab-btn'
    btn.textContent = '✏️ Meu Espaço'
    tabsBar.appendChild(btn)

    // Criar painel
    const painel = document.createElement('div')
    painel.className = 'fp-painel'
    painel.innerHTML = renderPainel()
    tabsBar.parentNode.insertBefore(painel, tabsBar.nextSibling.nextSibling || null)
    tabsBar.parentNode.appendChild(painel)

    // Ativar aba ao clicar
    btn.addEventListener('click', () => {
      area.querySelectorAll('.fp-painel').forEach(p => p.classList.remove('ativo'))
      area.querySelectorAll('.fp-tab').forEach(b => b.classList.remove('ativo'))
      painel.classList.add('ativo')
      btn.classList.add('ativo')
    })

    // Placeholder para próximas tasks
    wireAnotacoes(painel, arquivo)
    wireDiagramaTabs(painel, arquivo)
    wireApagar(painel, arquivo)
    restoreTexto(painel, arquivo)
  }

  // Stubs — implementados nas tasks seguintes
  function wireAnotacoes(painel, arquivo) {}
  function wireDiagramaTabs(painel, arquivo) {}
  function wireApagar(painel, arquivo) {}
  function restoreTexto(painel, arquivo) {}

  return { init }
})()
```

- [ ] **Step 2: Verificar no navegador**

Abra um tema (ex: Crimes contra a Fé Pública). A aba "✏️ Meu Espaço" deve aparecer ao final da barra de abas, com cor dourada. Clicar nela deve mostrar o painel com as abas "Anotações" e "Diagrama". Clicar em outra aba (ex: "Mapa Mental") deve esconder o painel. Console deve estar limpo.

- [ ] **Step 3: Commit**

```bash
git add meu-espaco.js
git commit -m "feat: scaffold MeuEspaco module and inject tab into theme pages"
```

---

## Task 3: Editor de anotações — toolbar + auto-save + restore

**Files:**
- Modify: `meu-espaco.js` (substituir stubs `wireAnotacoes` e `restoreTexto`)

- [ ] **Step 1: Implementar `wireAnotacoes` e `restoreTexto`**

Substituir os dois stubs no módulo:

```js
function wireAnotacoes(painel, arquivo) {
  const editor = painel.querySelector('.me-editor')
  const salvoSpan = painel.querySelector('.me-salvo')

  const save = debounce(() => {
    localStorage.setItem(storageKey('texto', arquivo), editor.innerHTML)
    salvoSpan.textContent = 'salvo ✓'
    setTimeout(() => { salvoSpan.textContent = '' }, 1500)
  }, 500)

  editor.addEventListener('input', save)

  painel.querySelectorAll('.me-tbtn').forEach(btn => {
    btn.addEventListener('mousedown', e => {
      e.preventDefault()
      const cmd = btn.dataset.cmd
      if (cmd === 'seta') {
        document.execCommand('insertHTML', false,
          '<span class="me-flow-arrow">⟶</span>\u200B')
      } else {
        document.execCommand(cmd, false, null)
      }
      editor.focus()
      save()
    })
  })
}

function restoreTexto(painel, arquivo) {
  const editor = painel.querySelector('.me-editor')
  const saved = localStorage.getItem(storageKey('texto', arquivo))
  if (saved) editor.innerHTML = saved
}
```

- [ ] **Step 2: Verificar no navegador**

1. Abra um tema, clique em "✏️ Meu Espaço"
2. Digite texto no editor — após 500ms o indicador "salvo ✓" deve aparecer brevemente
3. Selecione uma palavra, clique **B** — deve ficar em negrito
4. Clique *I* — itálico
5. Clique <u>U</u> — sublinhado
6. Clique "→ Fluxo" com cursor no texto — deve inserir ⟶ em azul
7. Recarregue a página, navegue de volta ao mesmo tema, abra "Meu Espaço" — o texto deve estar preservado
8. Abra outro tema — o editor deve estar vazio (dados isolados por tema)

- [ ] **Step 3: Commit**

```bash
git add meu-espaco.js
git commit -m "feat: add rich text editor with bold/italic/underline/arrow and localStorage auto-save"
```

---

## Task 4: Botão "Apagar tudo deste tema"

**Files:**
- Modify: `meu-espaco.js` (substituir stub `wireApagar`)

- [ ] **Step 1: Implementar `wireApagar`**

Substituir o stub:

```js
function wireApagar(painel, arquivo) {
  painel.querySelector('.me-apagar-btn').addEventListener('click', () => {
    if (!confirm('Apagar todas as anotações e diagramas deste tema?\nEsta ação não pode ser desfeita.')) return

    localStorage.removeItem(storageKey('texto', arquivo))
    localStorage.removeItem(storageKey('diagrama-mapa-mental', arquivo))
    localStorage.removeItem(storageKey('diagrama-linha-do-tempo', arquivo))
    localStorage.removeItem(storageKey('diagrama-canvas-livre', arquivo))

    painel.querySelector('.me-editor').innerHTML = ''

    if (painel._mesCanvases) {
      Object.values(painel._mesCanvases).forEach(fc => fc.clear())
    }
    painel._mesFabricLoaded = false
    delete painel._mesCanvases
  })
}
```

- [ ] **Step 2: Verificar no navegador**

1. Digite texto em "Anotações" e aguarde auto-save
2. Clique "🗑 Apagar tudo deste tema"
3. Diálogo de confirmação deve aparecer — clique "Cancelar": nada deve acontecer
4. Clique novamente, confirme — editor deve limpar
5. Recarregue a página, navegue ao tema: editor deve estar vazio

- [ ] **Step 3: Commit**

```bash
git add meu-espaco.js
git commit -m "feat: add 'apagar tudo deste tema' button with confirm dialog"
```

---

## Task 5: Estrutura da aba Diagrama — sub-tabs + lazy Fabric.js

**Files:**
- Modify: `meu-espaco.js` (substituir stub `wireDiagramaTabs`)

- [ ] **Step 1: Implementar `wireDiagramaTabs` com lazy load e sub-tabs**

Substituir o stub:

```js
function wireDiagramaTabs(painel, arquivo) {
  // Abas internas: Anotações ↔ Diagrama
  painel.querySelectorAll('.me-itab').forEach(tab => {
    tab.addEventListener('click', () => {
      painel.querySelectorAll('.me-itab').forEach(t => t.classList.remove('ativo'))
      painel.querySelectorAll('.me-ipainel').forEach(p => p.classList.remove('ativo'))
      tab.classList.add('ativo')
      painel.querySelector(`[data-me-painel="${tab.dataset.meTab}"]`).classList.add('ativo')
      if (tab.dataset.meTab === 'diagrama') initDiagramaLazy(painel, arquivo)
    })
  })

  // Sub-abas: Mapa Mental ↔ Linha do Tempo ↔ Canvas Livre
  painel.querySelectorAll('.me-stab').forEach(stab => {
    stab.addEventListener('click', () => {
      painel.querySelectorAll('.me-stab').forEach(t => t.classList.remove('ativo'))
      painel.querySelectorAll('.me-sub-painel').forEach(p => p.classList.remove('ativo'))
      stab.classList.add('ativo')
      painel.querySelector(`[data-me-spanel="${stab.dataset.meStab}"]`).classList.add('ativo')
    })
  })
}

function initDiagramaLazy(painel, arquivo) {
  if (painel._mesFabricLoaded) return
  painel._mesFabricLoaded = true
  loadFabric(() => {
    painel._mesCanvases = {}
    initMapaMental(painel, arquivo)
    initLinhaDoTempo(painel, arquivo)
    initCanvasLivre(painel, arquivo)
  })
}

// Stubs — implementados nas tasks 6-8
function initMapaMental(painel, arquivo) {}
function initLinhaDoTempo(painel, arquivo) {}
function initCanvasLivre(painel, arquivo) {}
```

- [ ] **Step 2: Verificar no navegador**

1. Abra um tema, clique em "✏️ Meu Espaço"
2. Clique na aba interna "Diagrama" — no DevTools (Network) deve aparecer o carregamento do `fabric.min.js`
3. Clicar em "Diagrama" novamente não deve disparar segundo carregamento do CDN
4. As três sub-abas (🧠 Mapa Mental, 📅 Linha do Tempo, 🎨 Canvas Livre) devem ser clicáveis e alternar painéis
5. Ao navegar para outro tema e voltar, Fabric.js já está em cache e não recarrega

- [ ] **Step 3: Commit**

```bash
git add meu-espaco.js
git commit -m "feat: wire diagram tabs with lazy Fabric.js CDN load"
```

---

## Task 6: Sub-aba Canvas Livre

**Files:**
- Modify: `meu-espaco.js` (substituir stub `initCanvasLivre`)

- [ ] **Step 1: Implementar `initCanvasLivre`**

Substituir o stub. Adicionar também o helper `salvarCanvas` antes de `init`:

```js
function salvarCanvas(fc, key) {
  localStorage.setItem(key, JSON.stringify(fc.toJSON()))
}
```

Stub de `initCanvasLivre`:

```js
function initCanvasLivre(painel, arquivo) {
  const key = storageKey('diagrama-canvas-livre', arquivo)
  const canvasEl = painel.querySelector('#me-canvas-livre')
  const w = Math.max(painel.clientWidth - 32, 320)

  const fc = new fabric.Canvas(canvasEl, {
    width: w, height: 280, backgroundColor: '#fafafa'
  })
  painel._mesCanvases['livre'] = fc

  let formaAtiva = 'caixa'

  painel.querySelectorAll('.me-sbtn').forEach(btn => {
    btn.addEventListener('click', () => {
      painel.querySelectorAll('.me-sbtn').forEach(b => b.classList.remove('ativo'))
      btn.classList.add('ativo')
      formaAtiva = btn.dataset.shape
    })
  })

  fc.on('mouse:down', opt => {
    if (opt.target) return
    const x = opt.e.offsetX, y = opt.e.offsetY
    let obj

    if (formaAtiva === 'caixa') {
      obj = new fabric.Rect({
        left: x - 40, top: y - 20,
        width: 80, height: 40,
        fill: '#dce6f1', stroke: '#1F497D', strokeWidth: 2, rx: 4, ry: 4
      })
    } else if (formaAtiva === 'circulo') {
      obj = new fabric.Circle({
        left: x - 30, top: y - 30, radius: 30,
        fill: '#dce6f1', stroke: '#1F497D', strokeWidth: 2
      })
    } else if (formaAtiva === 'texto') {
      obj = new fabric.IText('Texto', {
        left: x, top: y, fontSize: 14, fill: '#1a1a2e',
        fontFamily: 'Source Sans 3, sans-serif'
      })
      fc.add(obj)
      fc.setActiveObject(obj)
      obj.enterEditing()
      fc.renderAll()
      salvarCanvas(fc, key)
      return
    } else if (formaAtiva === 'seta') {
      const linha = new fabric.Line([0, 0, 80, 0], {
        stroke: '#1F497D', strokeWidth: 2
      })
      const ponta = new fabric.Triangle({
        left: 68, top: -6, width: 12, height: 12,
        fill: '#1F497D', angle: 90
      })
      obj = new fabric.Group([linha, ponta], { left: x, top: y })
    }

    if (obj) {
      fc.add(obj)
      fc.setActiveObject(obj)
      fc.renderAll()
      salvarCanvas(fc, key)
    }
  })

  fc.on('object:modified', () => salvarCanvas(fc, key))
  fc.on('text:changed', () => salvarCanvas(fc, key))

  const saved = localStorage.getItem(key)
  if (saved) fc.loadFromJSON(JSON.parse(saved), () => fc.renderAll())
}
```

- [ ] **Step 2: Verificar no navegador**

1. Abra "Meu Espaço" → "Diagrama" → "🎨 Canvas Livre"
2. Com □ Caixa selecionado, clique no canvas — deve aparecer um retângulo azul
3. Arraste o retângulo — deve mover
4. Selecione ○ Círculo, clique — deve inserir círculo
5. Selecione → Seta, clique — deve inserir seta
6. Selecione T Texto, clique — deve inserir IText editável
7. Recarregue e volte ao tema — as formas devem estar preservadas

- [ ] **Step 3: Commit**

```bash
git add meu-espaco.js
git commit -m "feat: implement canvas livre with shapes, drag, and localStorage persistence"
```

---

## Task 7: Sub-aba Mapa Mental

**Files:**
- Modify: `meu-espaco.js` (substituir stub `initMapaMental`)

- [ ] **Step 1: Implementar `initMapaMental`**

```js
function initMapaMental(painel, arquivo) {
  const key = storageKey('diagrama-mapa-mental', arquivo)
  const canvasEl = painel.querySelector('#me-canvas-mapa')
  const w = Math.max(painel.clientWidth - 32, 320)

  const fc = new fabric.Canvas(canvasEl, {
    width: w, height: 280, backgroundColor: '#fafafa'
  })
  painel._mesCanvases['mapa'] = fc

  let primeiroNo = null

  function criarNo(x, y, texto) {
    const rx = Math.max(texto.length * 5, 50)
    const ellipse = new fabric.Ellipse({
      rx, ry: 22, fill: '#dce6f1',
      stroke: '#1F497D', strokeWidth: 2,
      originX: 'center', originY: 'center', left: 0, top: 0
    })
    const label = new fabric.IText(texto, {
      fontSize: 13, fill: '#1a1a2e',
      fontFamily: 'Source Sans 3, sans-serif',
      originX: 'center', originY: 'center', left: 0, top: 0
    })
    return new fabric.Group([ellipse, label], {
      left: x - rx, top: y - 22
    })
  }

  fc.on('mouse:down', opt => {
    const e = opt.e
    if (e.shiftKey) {
      if (!opt.target || opt.target.type !== 'group') return
      if (!primeiroNo) {
        primeiroNo = opt.target
        primeiroNo.set('opacity', 0.6)
        fc.renderAll()
        return
      }
      const a = primeiroNo, b = opt.target
      const ax = a.left + a.width / 2
      const ay = a.top + a.height / 2
      const bx = b.left + b.width / 2
      const by = b.top + b.height / 2
      const linha = new fabric.Line([ax, ay, bx, by], {
        stroke: '#1F497D', strokeWidth: 1.5,
        selectable: true, hasBorders: false, hasControls: false
      })
      fc.add(linha)
      fc.sendToBack(linha)
      a.set('opacity', 1)
      fc.renderAll()
      primeiroNo = null
      salvarCanvas(fc, key)
      return
    }

    if (opt.target) return
    const texto = prompt('Texto do nó:')
    if (!texto || !texto.trim()) return
    const no = criarNo(e.offsetX, e.offsetY, texto.trim())
    fc.add(no)
    fc.setActiveObject(no)
    fc.renderAll()
    salvarCanvas(fc, key)
  })

  fc.on('mouse:dblclick', opt => {
    if (!opt.target || opt.target.type !== 'group') return
    const label = opt.target.getObjects('i-text')[0]
    if (!label) return
    const novo = prompt('Editar texto do nó:', label.text)
    if (novo === null) return
    label.set('text', novo.trim() || label.text)
    fc.renderAll()
    salvarCanvas(fc, key)
  })

  fc.on('object:modified', () => salvarCanvas(fc, key))

  const saved = localStorage.getItem(key)
  if (saved) fc.loadFromJSON(JSON.parse(saved), () => fc.renderAll())
}
```

- [ ] **Step 2: Verificar no navegador**

1. Abra "Meu Espaço" → "Diagrama" → "🧠 Mapa Mental"
2. Clique no canvas — prompt deve pedir texto; após digitar, nó oval deve aparecer
3. Crie um segundo nó clicando em outro ponto
4. Shift+clique no primeiro nó (fica semitransparente) → Shift+clique no segundo — linha de conexão deve aparecer entre eles
5. Duplo-clique em um nó — prompt deve abrir para editar o texto
6. Arraste um nó — deve mover
7. Recarregue, volte ao tema — nós e conexões devem estar preservados

- [ ] **Step 3: Commit**

```bash
git add meu-espaco.js
git commit -m "feat: implement mind map with nodes, connections, and edit via double-click"
```

---

## Task 8: Sub-aba Linha do Tempo

**Files:**
- Modify: `meu-espaco.js` (substituir stub `initLinhaDoTempo`)

- [ ] **Step 1: Implementar `initLinhaDoTempo`**

```js
function initLinhaDoTempo(painel, arquivo) {
  const key = storageKey('diagrama-linha-do-tempo', arquivo)
  const canvasEl = painel.querySelector('#me-canvas-linha')
  const w = Math.max(painel.clientWidth - 32, 320)

  const fc = new fabric.Canvas(canvasEl, {
    width: w, height: 150, backgroundColor: '#fafafa'
  })
  painel._mesCanvases['linha'] = fc

  const yLinha = 70

  function addBase() {
    const linhaBase = new fabric.Line([20, yLinha, w - 24, yLinha], {
      stroke: '#1F497D', strokeWidth: 3,
      selectable: false, evented: false, hoverCursor: 'default'
    })
    const ponta = new fabric.Triangle({
      left: w - 18, top: yLinha - 7, width: 14, height: 14,
      fill: '#1F497D', angle: 90,
      selectable: false, evented: false
    })
    fc.add(linhaBase)
    fc.add(ponta)
  }

  const saved = localStorage.getItem(key)
  if (saved) {
    fc.loadFromJSON(JSON.parse(saved), () => fc.renderAll())
  } else {
    addBase()
    fc.renderAll()
  }

  fc.on('mouse:down', opt => {
    if (opt.target) return
    const x = opt.e.offsetX
    const texto = prompt('Nome do evento:')
    if (!texto || !texto.trim()) return

    const circulo = new fabric.Circle({
      radius: 7, fill: '#1F497D',
      originX: 'center', originY: 'center', left: 0, top: 0
    })
    const label = new fabric.IText(texto.trim(), {
      fontSize: 12, fill: '#1a1a2e',
      fontFamily: 'Source Sans 3, sans-serif',
      originX: 'center', left: 0, top: 16
    })
    const grupo = new fabric.Group([circulo, label], {
      left: x - 7, top: yLinha - 7, hasControls: false
    })
    fc.add(grupo)
    fc.renderAll()
    salvarCanvas(fc, key)
  })

  fc.on('object:modified', () => salvarCanvas(fc, key))
}
```

- [ ] **Step 2: Verificar no navegador**

1. Abra "Meu Espaço" → "Diagrama" → "📅 Linha do Tempo"
2. Linha horizontal azul com seta deve aparecer
3. Clique na área do canvas — prompt deve pedir nome do evento
4. Marcador (círculo + texto) deve aparecer sobre a linha
5. Arraste o marcador — deve mover horizontalmente (e verticalmente, comportamento esperado com Fabric)
6. Adicione 3-4 eventos
7. Recarregue, volte ao tema — eventos devem estar preservados

- [ ] **Step 3: Commit**

```bash
git add meu-espaco.js
git commit -m "feat: implement timeline diagram with event markers and localStorage persistence"
```

---

## Task 9: Integração em app.js + teste final

**Files:**
- Modify: `app.js` (função `abrirTema`, após correções de caminhos, ~linha 625)

- [ ] **Step 1: Chamar `MeuEspaco.init` em `abrirTema`**

Em `app.js`, dentro da função `abrirTema`, encontrar o bloco `.then(html => { ... })`. Após a última linha de correção de links (`area.querySelectorAll('a[href^="#"]')...`), adicionar:

```js
      // Injeta aba "Meu Espaço" se a página tem sistema de abas
      if (typeof MeuEspaco !== 'undefined') {
        MeuEspaco.init(area, tema.arquivo)
      }
```

- [ ] **Step 2: Verificar integração completa em todos os temas**

Testar os seguintes temas para garantir que a aba aparece corretamente:

| Tema | Resultado esperado |
|------|--------------------|
| Crimes contra a Fé Pública | aba "✏️ Meu Espaço" aparece |
| Crimes contra a Adm. Pública | aba "✏️ Meu Espaço" aparece |
| Teoria Geral das Provas (Proc. Penal II) | aba "✏️ Meu Espaço" aparece |
| Tributário — qualquer tema | aba "✏️ Meu Espaço" aparece |

Para cada tema verificado: notas digitadas em um tema NÃO aparecem em outro (localStorage isolado).

- [ ] **Step 3: Teste de regressão nas abas existentes**

Abra qualquer tema e verifique:
- Clicar em "Visão Geral" esconde "Meu Espaço" (se estava ativo)
- Clicar em "Mapa Mental" / "Roteiro" / "Estudo de Caso" funciona normalmente
- Sem erros de console em nenhuma navegação

- [ ] **Step 4: Commit final**

```bash
git add app.js
git commit -m "feat: wire MeuEspaco.init into abrirTema — meu-espaco feature complete"
```

---

## Checklist de spec coverage

| Requisito do spec | Task |
|-------------------|------|
| Aba dourada ao final da barra | Task 2 |
| Editor com Bold, Italic, Underline | Task 3 |
| Botão → Fluxo | Task 3 |
| Auto-save debounced 500ms | Task 3 |
| Restore ao abrir | Task 3 |
| Apagar tudo deste tema com confirm | Task 4 |
| Diagrama — sub-abas | Task 5 |
| Lazy load Fabric.js | Task 5 |
| Canvas Livre com 4 formas | Task 6 |
| Mapa Mental — nós + conexões + editar | Task 7 |
| Linha do Tempo — eventos + arrastar | Task 8 |
| Integração em app.js sem tocar temas | Task 9 |
| Dados isolados por tema | Tasks 3, 6, 7, 8 |
| Mobile (flex-wrap) | Task 1 (CSS) |
