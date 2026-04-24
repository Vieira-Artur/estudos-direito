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
    if (!arquivo) return
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
    tabsBar.parentNode.appendChild(painel)

    // Ativar aba ao clicar
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
    if (saved) editor.innerHTML = sanitize(saved)
  }

  // Stubs — implementados nas tasks seguintes
  function wireDiagramaTabs(painel, arquivo) {}
  function wireApagar(painel, arquivo) {}

  return { init }
})()
