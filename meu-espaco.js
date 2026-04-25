const MeuEspaco = (() => {
  const FABRIC_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js'

  function storageKey(tipo, arquivo) {
    return `meu-espaco-${tipo}:${arquivo}`
  }

  // ── IndexedDB para imagens (sem limite de quota) ─────────
  const MaterialDB = (() => {
    const DB  = 'estudos-direito-material'
    const ST  = 'imagens'
    const VER = 1

    function open() {
      return new Promise((resolve, reject) => {
        const req = indexedDB.open(DB, VER)
        req.onupgradeneeded = e => {
          const db = e.target.result
          if (!db.objectStoreNames.contains(ST)) {
            const store = db.createObjectStore(ST, { keyPath: 'id' })
            store.createIndex('arquivo', 'arquivo', { unique: false })
          }
        }
        req.onsuccess = e => resolve(e.target.result)
        req.onerror   = e => reject(e.target.error)
      })
    }

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

    async function put(item) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const req = db.transaction(ST, 'readwrite').objectStore(ST).put(item)
        req.onsuccess = () => resolve()
        req.onerror   = e => reject(e.target.error)
      })
    }

    async function remove(id) {
      const db = await open()
      return new Promise((resolve, reject) => {
        const req = db.transaction(ST, 'readwrite').objectStore(ST).delete(id)
        req.onsuccess = () => resolve()
        req.onerror   = e => reject(e.target.error)
      })
    }

    async function clearByArquivo(arquivo) {
      const db  = await open()
      return new Promise((resolve, reject) => {
        const tx  = db.transaction(ST, 'readwrite')
        const cur = tx.objectStore(ST).index('arquivo')
          .openKeyCursor(IDBKeyRange.only(arquivo))
        cur.onsuccess = e => {
          const c = e.target.result
          if (c) { tx.objectStore(ST).delete(c.primaryKey); c.continue() }
        }
        tx.oncomplete = () => resolve()
        tx.onerror    = e => reject(e.target.error)
      })
    }

    return { getAll, put, remove, clearByArquivo }
  })()

  function debounce(fn, ms) {
    let t
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms) }
  }

  function loadFabric(cb) {
    if (window.fabric) return cb()
    let s = document.getElementById('me-fabric-script')
    if (s) {
      if (s.dataset.loaded) return cb()
      s.addEventListener('load', cb)
      return
    }
    s = document.createElement('script')
    s.id = 'me-fabric-script'
    s.src = FABRIC_CDN
    s.onload = () => { s.dataset.loaded = '1'; cb() }
    document.head.appendChild(s)
  }

  function sanitize(html) {
    const doc = new DOMParser().parseFromString(html, 'text/html')
    doc.querySelectorAll('script,style').forEach(el => el.remove())
    doc.querySelectorAll('*').forEach(el => {
      ;[...el.attributes].forEach(attr => {
        if (/^on/i.test(attr.name)) el.removeAttribute(attr.name)
      })
    })
    return doc.body.innerHTML
  }

  function renderPainel() {
    return `
      <div class="me-inner-tabs">
        <button class="me-itab ativo" data-me-tab="anotacoes">Anotações</button>
        <button class="me-itab" data-me-tab="diagrama">Diagrama</button>
        <button class="me-itab" data-me-tab="material">📎 Meu Material</button>
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
          <div class="me-canvas-rodape">
            <p class="me-canvas-hint">Clique na linha para adicionar evento · Arraste para mover · Del para apagar</p>
            <button class="me-limpar-btn" data-canvas="linha">🗑 Limpar</button>
          </div>
        </div>
        <div class="me-sub-painel" data-me-spanel="canvas-livre">
          <div class="me-shape-toolbar">
            <button class="me-sbtn ativo" data-shape="caixa">□ Caixa</button>
            <button class="me-sbtn" data-shape="circulo">○ Círculo</button>
            <button class="me-sbtn" data-shape="seta">→ Seta</button>
            <button class="me-sbtn" data-shape="texto">T Texto</button>
          </div>
          <canvas id="me-canvas-livre"></canvas>
          <div class="me-canvas-rodape">
            <p class="me-canvas-hint">Clique no canvas para inserir · Arraste para mover · Del para apagar</p>
            <button class="me-limpar-btn" data-canvas="livre">🗑 Limpar</button>
          </div>
        </div>
      </div>
      <div class="me-ipainel" data-me-painel="material">
        <div class="me-upload-zona">
          <input type="file" class="me-material-input" accept="image/*,application/pdf" multiple style="display:none">
          <button class="me-material-add-btn">📎 Adicionar arquivo</button>
          <p class="me-canvas-hint">Fotos de caderno, resumos, slides, PDFs...</p>
        </div>
        <div class="me-material-galeria"></div>
      </div>
    `
  }

  function init(area, arquivo) {
    if (!arquivo) return

    let tabsBar = area.querySelector('.fp-tabs')

    if (!tabsBar) {
      // Página sem sistema de abas: embrulha o conteúdo existente numa aba "Conteúdo"
      const conteudoPainel = document.createElement('div')
      conteudoPainel.className = 'fp-painel ativo'
      while (area.firstChild) conteudoPainel.appendChild(area.firstChild)

      tabsBar = document.createElement('div')
      tabsBar.className = 'fp-tabs'

      const conteudoBtn = document.createElement('button')
      conteudoBtn.className = 'fp-tab ativo'
      conteudoBtn.textContent = '📄 Conteúdo'
      tabsBar.appendChild(conteudoBtn)

      area.appendChild(tabsBar)
      area.appendChild(conteudoPainel)

      conteudoBtn.addEventListener('click', () => {
        area.querySelectorAll('.fp-painel').forEach(p => p.classList.remove('ativo'))
        area.querySelectorAll('.fp-tab').forEach(b => b.classList.remove('ativo'))
        conteudoPainel.classList.add('ativo')
        conteudoBtn.classList.add('ativo')
      })
    }

    const btn = document.createElement('button')
    btn.className = 'fp-tab me-tab-btn'
    btn.textContent = '✏️ Meu Espaço'
    tabsBar.appendChild(btn)

    const painel = document.createElement('div')
    painel.className = 'fp-painel'
    painel.innerHTML = renderPainel()
    tabsBar.parentNode.appendChild(painel)

    btn.addEventListener('click', () => {
      area.querySelectorAll('.fp-painel').forEach(p => p.classList.remove('ativo'))
      area.querySelectorAll('.fp-tab').forEach(b => b.classList.remove('ativo'))
      painel.classList.add('ativo')
      btn.classList.add('ativo')
    })

    wireAnotacoes(painel, arquivo)
    wireDiagramaTabs(painel, arquivo)
    wireApagar(painel, arquivo)
    restoreTexto(painel, arquivo)
    initUploadMaterial(painel, arquivo)
  }

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
            '<span class="me-flow-arrow">⟶</span>​')
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
    if (saved) editor.innerHTML = sanitize(saved)
  }

  function wireDiagramaTabs(painel, arquivo) {
    painel.querySelectorAll('.me-itab').forEach(tab => {
      tab.addEventListener('click', () => {
        painel.querySelectorAll('.me-itab').forEach(t => t.classList.remove('ativo'))
        painel.querySelectorAll('.me-ipainel').forEach(p => p.classList.remove('ativo'))
        tab.classList.add('ativo')
        painel.querySelector(`[data-me-painel="${tab.dataset.meTab}"]`).classList.add('ativo')
        if (tab.dataset.meTab === 'diagrama') initDiagramaLazy(painel, arquivo)
      })
    })

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

  function salvarCanvas(fc, key) {
    localStorage.setItem(key, JSON.stringify(fc.toJSON()))
  }

  // Retorna handler de Delete reutilizável para qualquer canvas Fabric
  function makeDeleteHandler(fc, key) {
    return (e) => {
      if (e.key !== 'Delete') return
      const el = document.activeElement
      const tag = (el?.tagName || '').toUpperCase()
      if (tag === 'INPUT') return
      if (el?.isContentEditable) return
      // Ignora TEXTAREA que não seja a interna do Fabric
      if (tag === 'TEXTAREA' && !fc.wrapperEl?.contains(el)) return
      const active = fc.getActiveObject()
      if (!active) return
      if (active.isEditing) active.exitEditing()
      e.preventDefault()
      fc.remove(active)
      fc.discardActiveObject()
      fc.renderAll()
      salvarCanvas(fc, key)
    }
  }

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
        if (primeiroNo === opt.target) {
          primeiroNo.set('opacity', 1)
          fc.renderAll()
          primeiroNo = null
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
      const no = criarNo(opt.pointer.x, opt.pointer.y, texto.trim())
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

    const onKey = makeDeleteHandler(fc, key)
    document.addEventListener('keydown', onKey)
    fc.on('canvas:disposed', () => document.removeEventListener('keydown', onKey))

    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        fc.loadFromJSON(JSON.parse(saved), () => fc.renderAll())
      } catch (e) {
        console.warn('MeuEspaco: dados corrompidos, resetando', key)
        localStorage.removeItem(key)
      }
    }
  }

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
      try {
        fc.loadFromJSON(JSON.parse(saved), () => fc.renderAll())
      } catch (e) {
        console.warn('MeuEspaco: dados corrompidos, resetando', key)
        localStorage.removeItem(key)
        addBase()
        fc.renderAll()
      }
    } else {
      addBase()
      fc.renderAll()
    }

    fc.on('mouse:down', opt => {
      if (opt.target) return
      const x = opt.pointer.x
      const texto = prompt('Nome do evento:')
      if (!texto || !texto.trim()) return

      const circulo = new fabric.Circle({
        radius: 7, fill: '#1F497D',
        originX: 'center', originY: 'center', left: 0, top: 0
      })
      const label = new fabric.IText(texto.trim(), {
        fontSize: 12, fill: '#1a1a2e',
        fontFamily: 'Source Sans 3, sans-serif',
        originX: 'center', originY: 'center', left: 0, top: 16
      })
      const grupo = new fabric.Group([circulo, label], {
        left: x - 7, top: yLinha - 7, hasControls: false
      })
      fc.add(grupo)
      fc.renderAll()
      salvarCanvas(fc, key)
    })

    fc.on('object:modified', () => salvarCanvas(fc, key))

    const onKey = makeDeleteHandler(fc, key)
    document.addEventListener('keydown', onKey)
    fc.on('canvas:disposed', () => document.removeEventListener('keydown', onKey))

    painel.querySelector('.me-limpar-btn[data-canvas="linha"]').addEventListener('click', () => {
      if (!confirm('Limpar toda a linha do tempo?')) return
      fc.clear()
      addBase()
      fc.renderAll()
      localStorage.removeItem(key)
    })
  }

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
      const x = opt.pointer.x, y = opt.pointer.y

      if (formaAtiva === 'texto') {
        const obj = new fabric.IText('Texto', {
          left: x, top: y,
          originX: 'center', originY: 'center',
          fontSize: 14, fill: '#1a1a2e',
          fontFamily: 'Source Sans 3, sans-serif'
        })
        fc.add(obj)
        fc.setActiveObject(obj)
        obj.enterEditing()
        fc.renderAll()
        salvarCanvas(fc, key)
        return
      }

      if (opt.target) return
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

    const onKey = makeDeleteHandler(fc, key)
    document.addEventListener('keydown', onKey)
    fc.on('canvas:disposed', () => document.removeEventListener('keydown', onKey))

    painel.querySelector('.me-limpar-btn[data-canvas="livre"]').addEventListener('click', () => {
      if (!confirm('Limpar todo o canvas?')) return
      fc.clear()
      fc.backgroundColor = '#fafafa'
      fc.renderAll()
      localStorage.removeItem(key)
    })

    const saved = localStorage.getItem(key)
    if (saved) {
      try {
        fc.loadFromJSON(JSON.parse(saved), () => fc.renderAll())
      } catch (e) {
        console.warn('MeuEspaco: dados corrompidos, resetando', key)
        localStorage.removeItem(key)
      }
    }
  }

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
        galeria.innerHTML = '<p class="me-galeria-vazia">Nenhum arquivo ainda.</p>'
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
              <button class="me-material-ver" data-id="${item.id}" title="Ver">↗</button>
              <button class="me-material-del" data-id="${item.id}" title="Remover">✕</button>
            </div>
            <div class="me-material-ordem">
              <button class="me-material-up"   data-id="${item.id}" title="Mover para cima"  ${isFirst ? 'disabled' : ''}>↑</button>
              <button class="me-material-down" data-id="${item.id}" title="Mover para baixo" ${isLast  ? 'disabled' : ''}>↓</button>
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
          const tmp          = all[idx].order
          all[idx].order     = all[idx - 1].order
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

  function wireApagar(painel, arquivo) {
    painel.querySelector('.me-apagar-btn').addEventListener('click', async () => {
      if (!confirm('Apagar todas as anotações e diagramas deste tema?\nEsta ação não pode ser desfeita.')) return

      localStorage.removeItem(storageKey('texto', arquivo))
      localStorage.removeItem(storageKey('diagrama-mapa-mental', arquivo))
      localStorage.removeItem(storageKey('diagrama-linha-do-tempo', arquivo))
      localStorage.removeItem(storageKey('diagrama-canvas-livre', arquivo))
      await MaterialDB.clearByArquivo(arquivo)

      painel.querySelector('.me-editor').innerHTML = ''
      painel.querySelector('.me-material-galeria').innerHTML = ''

      if (painel._mesCanvases) {
        Object.values(painel._mesCanvases).forEach(fc => fc.dispose())
      }
      painel._mesFabricLoaded = false
      delete painel._mesCanvases
    })
  }

  return { init }
})()
