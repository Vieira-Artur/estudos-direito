# Meu Material — Legenda, Reordenação e PDF — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar legenda editável, botões ↑↓ de reordenação e suporte a PDF no painel "Meu Material" do Meu Espaço.

**Architecture:** Todas as mudanças ficam em `meu-espaco.js` e `meu-espaco.css`. `MaterialDB.getAll` aplica migração de campos novos (`type`, `caption`, `order`) a itens antigos. `initUploadMaterial` é reescrita para lidar com PDF, renderizar o novo HTML de galeria e conectar os event listeners de reordenação, legenda e visualização.

**Tech Stack:** JavaScript vanilla, IndexedDB (via MaterialDB já existente).

---

### Task 1: Migração em MaterialDB.getAll

**Files:**
- Modify: `C:/Users/artur/Documents/estudos-direito/meu-espaco.js` — função `getAll` (~linha 29)

- [ ] **Passo 1: Localizar getAll**

A função atual em `meu-espaco.js` (~linha 29):
```js
async function getAll(arquivo) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction(ST, 'readonly')
      .objectStore(ST).index('arquivo').getAll(arquivo)
    req.onsuccess = () => resolve(req.result)
    req.onerror   = e => reject(e.target.error)
  })
}
```

- [ ] **Passo 2: Substituir por versão com migração**

```js
async function getAll(arquivo) {
  const db = await open()
  return new Promise((resolve, reject) => {
    const req = db.transaction(ST, 'readonly')
      .objectStore(ST).index('arquivo').getAll(arquivo)
    req.onsuccess = () => {
      const items = req.result.map((item, i) => ({
        type:    item.nome?.toLowerCase().endsWith('.pdf') ? 'pdf' : 'image',
        caption: '',
        order:   i * 1000,
        ...item
      }))
      items.sort((a, b) => a.order - b.order)
      resolve(items)
    }
    req.onerror = e => reject(e.target.error)
  })
}
```

**Por que funciona:** o spread `...item` sobrescreve os defaults quando o campo já existe no item armazenado. Para itens antigos que não têm `type`/`caption`/`order`, os defaults são aplicados.

- [ ] **Passo 3: Verificar**

Leia as linhas 29–40 após editar e confirme que a função tem o `.map` com os defaults e o `.sort`.

---

### Task 2: Reescrever initUploadMaterial

**Files:**
- Modify: `C:/Users/artur/Documents/estudos-direito/meu-espaco.js` — função `initUploadMaterial` (~linha 589)

- [ ] **Passo 1: Substituir a função inteira**

Localizar `function initUploadMaterial(painel, arquivo) {` e substituir toda a função (até o `}` de fechamento dela) pelo código abaixo:

```js
function initUploadMaterial(painel, arquivo) {
  const galeria = painel.querySelector('.me-material-galeria')
  const input   = painel.querySelector('.me-material-input')
  const addBtn  = painel.querySelector('.me-material-add-btn')

  input.accept = 'image/*,application/pdf'

  const escAttr = s => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;')

  function abrirPdf(dataUrl) {
    const arr  = dataUrl.split(',')
    const mime = arr[0].match(/:(.*?);/)[1]
    const bstr = atob(arr[1])
    const u8   = new Uint8Array(bstr.length)
    for (let i = 0; i < bstr.length; i++) u8[i] = bstr.charCodeAt(i)
    window.open(URL.createObjectURL(new Blob([u8], { type: mime })))
  }

  function abrirLightbox(dataUrl, nome) {
    const overlay = document.createElement('div')
    overlay.className = 'me-lightbox'
    overlay.innerHTML = `
      <div class="me-lightbox-inner">
        <button class="me-lightbox-fechar" title="Fechar">✕</button>
        <p class="me-lightbox-nome">${escAttr(nome)}</p>
        <img class="me-lightbox-img" src="${dataUrl}" alt="${escAttr(nome)}">
      </div>
    `
    overlay.addEventListener('click', e => { if (e.target === overlay) overlay.remove() })
    overlay.querySelector('.me-lightbox-fechar').addEventListener('click', () => overlay.remove())
    const onEsc = e => { if (e.key === 'Escape') { overlay.remove(); document.removeEventListener('keydown', onEsc) } }
    document.addEventListener('keydown', onEsc)
    document.body.appendChild(overlay)
  }

  async function renderGaleria() {
    const items = await MaterialDB.getAll(arquivo)
    if (items.length === 0) {
      galeria.innerHTML = '<p class="me-galeria-vazia">Nenhuma imagem ainda.</p>'
      return
    }

    galeria.innerHTML = items.map((item, i) => {
      const isFirst = i === 0
      const isLast  = i === items.length - 1
      const thumb = item.type === 'pdf'
        ? `<div class="me-pdf-thumb"><span class="me-pdf-icone">📄</span><span class="me-pdf-nome">${escAttr(item.nome)}</span></div>`
        : `<img class="me-material-img" src="${item.dataUrl}" alt="${escAttr(item.nome)}" title="${escAttr(item.nome)}">`
      return `
        <div class="me-material-item" data-id="${item.id}">
          ${thumb}
          <div class="me-material-acoes">
            <button class="me-material-up"   data-id="${item.id}" title="Mover para cima"  ${isFirst ? 'disabled' : ''}>↑</button>
            <button class="me-material-down" data-id="${item.id}" title="Mover para baixo" ${isLast  ? 'disabled' : ''}>↓</button>
            <button class="me-material-ver"  data-id="${item.id}" title="Ver">↗</button>
            <button class="me-material-del"  data-id="${item.id}" title="Remover">✕</button>
          </div>
          <input class="me-material-caption" data-id="${item.id}" type="text"
                 value="${escAttr(item.caption || '')}" placeholder="Adicionar legenda...">
        </div>`
    }).join('')

    galeria.querySelectorAll('.me-material-up').forEach(btn => {
      btn.addEventListener('click', async () => {
        const all = await MaterialDB.getAll(arquivo)
        const idx = all.findIndex(i => i.id === btn.dataset.id)
        if (idx <= 0) return
        const tmp        = all[idx].order
        all[idx].order   = all[idx - 1].order
        all[idx - 1].order = tmp
        await MaterialDB.put(all[idx])
        await MaterialDB.put(all[idx - 1])
        renderGaleria()
      })
    })

    galeria.querySelectorAll('.me-material-down').forEach(btn => {
      btn.addEventListener('click', async () => {
        const all = await MaterialDB.getAll(arquivo)
        const idx = all.findIndex(i => i.id === btn.dataset.id)
        if (idx < 0 || idx >= all.length - 1) return
        const tmp          = all[idx].order
        all[idx].order     = all[idx + 1].order
        all[idx + 1].order = tmp
        await MaterialDB.put(all[idx])
        await MaterialDB.put(all[idx + 1])
        renderGaleria()
      })
    })

    galeria.querySelectorAll('.me-material-ver').forEach(btn => {
      btn.addEventListener('click', async () => {
        const all  = await MaterialDB.getAll(arquivo)
        const item = all.find(i => i.id === btn.dataset.id)
        if (!item) return
        if (item.type === 'pdf') abrirPdf(item.dataUrl)
        else abrirLightbox(item.dataUrl, item.nome)
      })
    })

    galeria.querySelectorAll('.me-material-del').forEach(btn => {
      btn.addEventListener('click', async () => {
        await MaterialDB.remove(btn.dataset.id)
        renderGaleria()
      })
    })

    galeria.querySelectorAll('.me-material-caption').forEach(inp => {
      inp.addEventListener('blur', async () => {
        const all  = await MaterialDB.getAll(arquivo)
        const item = all.find(i => i.id === inp.dataset.id)
        if (!item) return
        item.caption = inp.value.trim()
        await MaterialDB.put(item)
      })
    })
  }

  addBtn.addEventListener('click', () => input.click())

  input.addEventListener('change', () => {
    const files = Array.from(input.files)
    if (!files.length) return
    input.value = ''
    let pending = files.length
    files.forEach((file, idx) => {
      const order = Date.now() + idx * 100
      const id    = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
      if (file.type === 'application/pdf') {
        const reader = new FileReader()
        reader.onload = async ev => {
          await MaterialDB.put({ id, arquivo, nome: file.name, dataUrl: ev.target.result, type: 'pdf', caption: '', order })
          if (--pending === 0) renderGaleria()
        }
        reader.readAsDataURL(file)
      } else {
        const reader = new FileReader()
        reader.onload = ev => {
          const img = new Image()
          img.onload = async () => {
            const MAX = 1200
            let w = img.width, h = img.height
            if (w > MAX || h > MAX) {
              if (w >= h) { h = Math.round(h * MAX / w); w = MAX }
              else        { w = Math.round(w * MAX / h); h = MAX }
            }
            const tmp = document.createElement('canvas')
            tmp.width = w; tmp.height = h
            tmp.getContext('2d').drawImage(img, 0, 0, w, h)
            const dataUrl = tmp.toDataURL('image/jpeg', 0.8)
            await MaterialDB.put({ id, arquivo, nome: file.name, dataUrl, type: 'image', caption: '', order })
            if (--pending === 0) renderGaleria()
          }
          img.src = ev.target.result
        }
        reader.readAsDataURL(file)
      }
    })
  })

  renderGaleria()
}
```

- [ ] **Passo 2: Verificar**

Leia a função após editar e confirme:
1. `input.accept = 'image/*,application/pdf'` está presente
2. `abrirPdf` existe com a lógica de Blob URL
3. `renderGaleria` tem botões `me-material-up`, `me-material-down` e input `me-material-caption`
4. O handler de `change` bifurca em `application/pdf` vs imagem
5. Novos itens incluem `type`, `caption`, `order` no objeto passado para `MaterialDB.put`

---

### Task 3: CSS para novos elementos

**Files:**
- Modify: `C:/Users/artur/Documents/estudos-direito/meu-espaco.css`

- [ ] **Passo 1: Localizar ponto de inserção**

Encontrar `.me-material-del:hover { background: #DC2626; }` e inserir o bloco abaixo IMEDIATAMENTE APÓS essa linha.

- [ ] **Passo 2: Inserir CSS**

```css
/* ── PDF thumbnail ─────────────────────────────────────── */
.me-pdf-thumb {
  display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: 4px;
  aspect-ratio: 4/3; background: #f1f5f9;
  border-radius: 4px 4px 0 0;
}
.me-pdf-icone { font-size: 28px; line-height: 1; }
.me-pdf-nome  {
  font-size: 10px; color: var(--text2); font-family: var(--sans);
  max-width: 100%; overflow: hidden; text-overflow: ellipsis;
  white-space: nowrap; padding: 0 4px; text-align: center;
}

/* ── Botões ↑↓ (reutilizam estilo de ver/del) ─────────── */
.me-material-up,
.me-material-down {
  width: 22px; height: 22px; border-radius: 50%; border: none;
  cursor: pointer; font-size: 12px; font-weight: 700;
  background: rgba(0,0,0,.55); color: #fff;
  display: flex; align-items: center; justify-content: center;
}
.me-material-up:hover,
.me-material-down:hover   { background: var(--blue); }
.me-material-up:disabled,
.me-material-down:disabled { opacity: .3; cursor: default; }

/* ── Legenda ────────────────────────────────────────────── */
.me-material-caption {
  width: 100%; box-sizing: border-box;
  border: none; border-top: 1px solid var(--border);
  padding: 4px 6px; font-size: 11px; font-family: var(--sans);
  color: var(--text); background: var(--surface);
  border-radius: 0 0 6px 6px; outline: none;
}
.me-material-caption::placeholder { color: var(--text2); }
.me-material-caption:focus { background: var(--blue-light); }
```

- [ ] **Passo 3: Verificar**

Leia as linhas após `.me-material-del:hover` e confirme que os 3 blocos (PDF thumbnail, botões ↑↓, legenda) estão presentes.

---

### Task 4: Commit

**Files:** `meu-espaco.js`, `meu-espaco.css`

- [ ] **Passo 1: Commit**

```bash
cd C:/Users/artur/Documents/estudos-direito
git add meu-espaco.js meu-espaco.css
git commit -m "feat: Meu Material — legenda, reordenação e suporte a PDF

- Legenda editável por item (salva no IndexedDB ao sair do campo)
- Botões ↑↓ para reordenar itens na galeria
- Upload e visualização de PDFs via Blob URL
- Migração automática de itens antigos para novo modelo"
```
