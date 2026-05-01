// === Google Analytics 4 (GA4) — Estudos em Direito ===
(function(){
    var GA_ID = 'G-S3YX8G99TS';
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    window.dataLayer = window.dataLayer || [];
    function gtag(){ dataLayer.push(arguments); }
    window.gtag = gtag;
    gtag('js', new Date());
    gtag('config', GA_ID, { send_page_view: false });
    function sendPageView(){
          gtag('event', 'page_view', {
                  page_location: location.href,
                  page_path: location.pathname + location.search + location.hash,
                  page_title: document.title
          });
    }
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
          sendPageView();
    } else {
          window.addEventListener('DOMContentLoaded', sendPageView);
    }
    ['pushState','replaceState'].forEach(function(method){
          var orig = history[method];
          history[method] = function(){
                  var ret = orig.apply(this, arguments);
                  window.dispatchEvent(new Event('locationchange'));
                  return ret;
          };
    });
    window.addEventListener('popstate', function(){ window.dispatchEvent(new Event('locationchange')); });
    window.addEventListener('hashchange', function(){ window.dispatchEvent(new Event('locationchange')); });
    window.addEventListener('locationchange', function(){ setTimeout(sendPageView, 50); });
})();

// ── Utilitário de scroll suave respeitando prefers-reduced-motion ──
function scrollSuave(el, opts = {}) {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  el.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'start', ...opts })
}

// ── Skeleton loaders ────────────────────────────────────

function skeletonConteudo() {
  return `
  <div id="conteudo-area" style="animation:none">
    <div class="sk" style="height:22px;width:52%;margin-bottom:22px"></div>
    <div class="sk" style="height:13px;width:100%;margin-bottom:9px"></div>
    <div class="sk" style="height:13px;width:91%;margin-bottom:9px"></div>
    <div class="sk" style="height:13px;width:74%;margin-bottom:28px"></div>
    <div class="sk" style="height:13px;width:100%;margin-bottom:9px"></div>
    <div class="sk" style="height:13px;width:85%;margin-bottom:9px"></div>
    <div class="sk" style="height:13px;width:61%;margin-bottom:28px"></div>
    <div class="sk" style="height:13px;width:100%;margin-bottom:9px"></div>
    <div class="sk" style="height:13px;width:93%;margin-bottom:9px"></div>
    <div class="sk" style="height:13px;width:68%"></div>
  </div>`
}

function skeletonSobre() {
  return `
  <div style="border-radius:10px;overflow:hidden;box-shadow:var(--shadow-md);animation:fadeUp .3s ease both">
    <div style="background:linear-gradient(135deg,#162f52 0%,#1F497D 100%);border-bottom:2px solid var(--blue-accent);padding:2.2rem 2rem;display:flex;align-items:center;gap:2rem;flex-wrap:wrap">
      <div class="sk-inv" style="width:110px;height:110px;border-radius:50%;flex-shrink:0"></div>
      <div style="flex:1;min-width:150px">
        <div class="sk-inv" style="height:20px;width:180px;margin-bottom:12px"></div>
        <div class="sk-inv" style="height:13px;width:130px;margin-bottom:14px"></div>
        <div style="display:flex;gap:7px;flex-wrap:wrap">
          <div class="sk-inv" style="height:22px;width:90px;border-radius:11px"></div>
          <div class="sk-inv" style="height:22px;width:110px;border-radius:11px"></div>
          <div class="sk-inv" style="height:22px;width:75px;border-radius:11px"></div>
        </div>
      </div>
    </div>
    <div style="background:var(--surface);padding:2rem">
      <div class="sk" style="height:15px;width:28%;margin-bottom:18px"></div>
      <div class="sk" style="height:12px;width:100%;margin-bottom:9px"></div>
      <div class="sk" style="height:12px;width:86%;margin-bottom:9px"></div>
      <div class="sk" style="height:12px;width:70%;margin-bottom:28px"></div>
      <div class="sk" style="height:15px;width:22%;margin-bottom:18px"></div>
      <div class="sk" style="height:12px;width:100%;margin-bottom:9px"></div>
      <div class="sk" style="height:12px;width:78%"></div>
    </div>
  </div>`
}

// ── HTML escape helper ──────────────────────────────────
function esc(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}


// ── Base URL (capturada antes de qualquer pushState) ────
const SITE_BASE = new URL('./', document.baseURI).href
const BASE_PATH = new URL('./', document.baseURI).pathname  // ex: "/estudos-direito/" ou "/"

// ── Helpers globais ─────────────────────────────────────
function _confirmar(msg) {
  return new Promise(resolve => {
    const d = document.createElement('dialog')
    d.className = 'app-dlg'
    d.setAttribute('aria-modal', 'true')
    d.innerHTML = `<p class="app-dlg-msg">${msg}</p><div class="app-dlg-btns"><button class="app-dlg-cancel">Cancelar</button><button class="app-dlg-ok">Confirmar</button></div>`
    document.body.appendChild(d)
    d.showModal()
    const fim = v => { d.close(); d.remove(); resolve(v) }
    d.querySelector('.app-dlg-ok').onclick     = () => fim(true)
    d.querySelector('.app-dlg-cancel').onclick  = () => fim(false)
    d.addEventListener('cancel', () => fim(false))
  })
}

function _fetchComTimeout(url, ms = 8000) {
  const ctrl = new AbortController()
  const id   = setTimeout(() => ctrl.abort(), ms)
  return fetch(url, { signal: ctrl.signal }).finally(() => clearTimeout(id))
}

function _atualizarOG(titulo, desc) {
  const base = 'Estudos Complementares — Prof. Artur Vieira'
  const descPad = 'Material de estudos complementares de Direito — Prof. Artur Vieira.'
  document.querySelector('meta[property="og:title"]').content       = titulo ? `${titulo} — ${base}` : base
  document.querySelector('meta[property="og:description"]').content = desc || descPad
  document.querySelector('meta[property="og:url"]').content         = location.href
  document.querySelector('meta[name="description"]').content        = desc || descPad
}

// ── Estado ──────────────────────────────────────────────
const estado = { materiaAtual: null, turmaAtual: null, infoAtual: null }

// ── Referências DOM ─────────────────────────────────────
const app        = document.getElementById('app')
const breadcrumb = document.getElementById('breadcrumb')

// ── Inicialização ────────────────────────────────────────
function inicializarRota() {
  // Restaura caminho após redirecionamento do 404.html (GitHub Pages SPA)
  const redirectPath = new URLSearchParams(window.location.search).get('p')
  if (redirectPath) {
    const decoded = decodeURIComponent(redirectPath)
    history.replaceState(null, '', BASE_PATH + decoded.replace(/^\//, ''))
  }

  const rawPath = window.location.pathname
  const path = '/' + (rawPath.startsWith(BASE_PATH)
    ? rawPath.slice(BASE_PATH.length)
    : rawPath.slice(1)
  ).replace(/\/$/, '')

  if (path === '/' || path === '') {
    history.replaceState({ view: 'materias' }, '', BASE_PATH)
    renderArvore(true)
    return
  }

  if (path === '/sobre') {
    history.replaceState({ view: 'sobre' }, '', BASE_PATH + 'sobre')
    abrirSobre(true)
    return
  }

  for (const materia of materias) {
    if (path === `/${materia.id}`) {
      history.replaceState({ view: 'materia', materiaId: materia.id }, '', BASE_PATH + materia.id)
      selecionarMateria(materia.id, true)
      return
    }
    for (const turma of materia.turmas) {
      if (path === `/${materia.id}/${turma.id}`) {
        estado.materiaAtual = materia
        estado.turmaAtual   = turma
        history.replaceState({ view: 'turma', materiaId: materia.id, turmaId: turma.id }, '', BASE_PATH + materia.id + '/' + turma.id)
        selecionarTurma(materia.id, turma.id, true)
        return
      }
      for (let i = 0; i < turma.temas.length; i++) {
        const tema = turma.temas[i]
        const slug = tema.arquivo.replace('conteudo/', '').replace('.html', '')
        if (path === `/${slug}`) {
          estado.materiaAtual = materia
          estado.turmaAtual   = turma
          history.replaceState({
            view: 'tema',
            materiaId: materia.id,
            turmaId: turma.id,
            temaIndex: i
          }, '', BASE_PATH + slug)
          abrirTema(i, true)
          return
        }
      }
    }
  }

  // Verifica rota de informativo: /materiaId/turmaId/numInfo
  const segs = path.replace(/^\//, '').split('/')
  if (segs.length === 3 && /^\d+$/.test(segs[2])) {
    const [mId, tId, numInfo] = segs
    const matInfo = materias.find(m => m.id === mId)
    if (matInfo) {
      const turInfo = matInfo.turmas.find(t => t.id === tId && t.indice)
      if (turInfo) {
        const base = turInfo.indice.substring(0, turInfo.indice.lastIndexOf('/') + 1)
        const arquivo = base + 'informativo-' + String(numInfo).padStart(4, '0') + '.html'
        estado.materiaAtual = matInfo
        estado.turmaAtual   = turInfo
        history.replaceState({ view: 'informativo', materiaId: mId, turmaId: tId, arquivo }, '', BASE_PATH + mId + '/' + tId + '/' + numInfo)
        selecionarTurma(mId, tId, true, arquivo)
        return
      }
    }
  }

  history.replaceState({ view: 'materias' }, '', BASE_PATH)
  renderArvore(true)
}

inicializarRota()
setTimeout(indexarConteudo, 2000) // indexa em background após carregamento inicial

// ── Histórico do navegador ───────────────────────────────
window.addEventListener('popstate', (e) => {
  const s = e.state
  if (!s || s.view === 'materias') {
    renderArvore(true)
  } else if (s.view === 'sobre') {
    abrirSobre(true)
  } else if (s.view === 'materia') {
    selecionarMateria(s.materiaId, true)
  } else if (s.view === 'turma') {
    selecionarTurma(s.materiaId, s.turmaId, true)
  } else if (s.view === 'informativo') {
    selecionarTurma(s.materiaId, s.turmaId, true, s.arquivo)
  } else if (s.view === 'tema') {
    const materia = materias.find(m => m.id === s.materiaId)
    const turma   = materia.turmas.find(t => t.id === s.turmaId)
    estado.materiaAtual = materia
    estado.turmaAtual   = turma
    abrirTema(s.temaIndex, true)
  }
})

// ── Renderização ─────────────────────────────────────────

function renderArvore(fromPop = false) {
  estado.materiaAtual = null
  estado.turmaAtual   = null
  document.title = 'Estudos Complementares — Prof. Artur Vieira'
  atualizarBreadcrumb()
  if (!fromPop) history.pushState({ view: 'materias' }, '', BASE_PATH)
  _atualizarOG()
  window.scrollTo(0, 0)

  app.innerHTML = `
    <div class="hero">
      <div class="hero-sup">Prof. Artur Vieira</div>
      <h1>Material de apoio para os estudos de Direito</h1>
      <p class="hero-desc">Mapas mentais, roteiros de estudo e casos práticos organizados por disciplina. Selecione uma matéria para começar.</p>
    </div>
    <p class="secao-titulo">Matérias</p>
    <div class="materias-cards">
      ${materias.map(m => `
          <div class="card-materia" role="button" tabindex="0"
               aria-label="Abrir ${m.titulo}"
               onclick="selecionarMateria('${m.id}')"
               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selecionarMateria('${m.id}')}">
            <div class="card-materia-icon">${m.icone}</div>
            <div class="card-materia-body">
              <div class="card-materia-titulo">${m.titulo}</div>
              <div class="card-materia-sub">${m.turmas.length} turma${m.turmas.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="card-materia-arrow" aria-hidden="true">›</div>
          </div>
        `).join('')}
    </div>
  `
}

function selecionarMateria(id, fromPop = false) {
  const materia = materias.find(m => m.id === id)
  estado.materiaAtual = materia
  estado.turmaAtual   = null
  document.title = `${materia.titulo} — Estudos Complementares`
  atualizarBreadcrumb()
  if (!fromPop) history.pushState({ view: 'materia', materiaId: id }, '', BASE_PATH + id)
  _atualizarOG(materia.titulo, materia.descricao)
  window.scrollTo(0, 0)

  if (materia.turmas.length === 0) {
    app.innerHTML = `<p class="secao-titulo">Nenhuma turma cadastrada ainda para ${materia.titulo}.</p>`
    return
  }

  app.innerHTML = `
    <p class="secao-titulo">${materia.titulo} — Selecione a turma</p>
    <div class="cards-turmas">
      ${materia.turmas.map(t => `
        <div class="card-turma" role="button" tabindex="0"
             aria-label="${t.titulo}"
             onclick="selecionarTurma('${materia.id}', '${t.id}')"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selecionarTurma('${materia.id}','${t.id}')}">
          ${t.titulo}
        </div>
      `).join('')}
    </div>
  `
}

function selecionarTurma(materiaId, turmaId, fromPop = false, infoArquivo = null) {
  const materia = materias.find(m => m.id === materiaId)
  const turma   = materia.turmas.find(t => t.id === turmaId)
  estado.materiaAtual = materia
  estado.turmaAtual   = turma
  estado.infoAtual    = null
  document.title = `${turma.titulo} — ${materia.titulo}`
  atualizarBreadcrumb()
  if (!fromPop) history.pushState({ view: 'turma', materiaId, turmaId }, '', BASE_PATH + materiaId + '/' + turmaId)
  _atualizarOG(`${turma.titulo} — ${materia.titulo}`)
  window.scrollTo(0, 0)

  app.innerHTML = `
    <p class="secao-titulo">${turma.titulo}</p>
    <div class="turma-tabs" id="turma-tabs">
      <button class="turma-tab ativa" id="tab-conteudo" onclick="mostrarTabConteudo()">📚 Conteúdo</button>
      <button class="turma-tab" id="tab-flash" onclick="mostrarTabFlash()">🃏 Flashcards</button>
    </div>
    <div id="tab-area-conteudo"></div>
    <div id="tab-area-flash" style="display:none"></div>
  `

  if (infoArquivo) {
    _abrirFragmentoDoIndice(infoArquivo, true)
  } else {
    renderConteudoTurma(turma)
  }
}

function renderConteudoTurma(turma) {
  const area = document.getElementById('tab-area-conteudo')
  if (!area) return

  if (turma.indice) {
    area.innerHTML = skeletonConteudo()
    _fetchComTimeout(SITE_BASE + turma.indice)
      .then(r => {
        if (!r.ok) throw new Error('Arquivo não encontrado')
        return r.text()
      })
      .then(html => {
        const el = document.getElementById('conteudo-area')
        if (!el) return
        el.innerHTML = html
        el.style.animation = 'none'
        void el.offsetWidth
        el.style.removeProperty('animation')
        const base = turma.indice.substring(0, turma.indice.lastIndexOf('/') + 1)
        el.querySelectorAll('a[href]').forEach(a => {
          const href = a.getAttribute('href')
          if (href && !href.startsWith('http') && !href.startsWith('#')) {
            const arquivo = base + href
            const temaIndex = turma.temas.findIndex(t => t.arquivo === arquivo)
            if (temaIndex !== -1) {
              a.href = '#'
              a.onclick = (e) => { e.preventDefault(); abrirTema(temaIndex) }
            } else if (/\.html$/.test(href) && !href.includes('/')) {
              // Link relativo a um HTML no mesmo diretório do índice (ex: informativos)
              a.href = '#'
              a.onclick = (e) => { e.preventDefault(); _abrirFragmentoDoIndice(arquivo) }
            }
          }
        })
        linkificarJulgados(el)
      })
      .catch(() => {
        const el = document.getElementById('conteudo-area')
        if (el) el.innerHTML = `<p style="color:#c00">Não foi possível carregar o material. Tente recarregar a página.</p>`
      })
    return
  }

  if (turma.temas.length === 0) {
    area.innerHTML = `<p class="secao-titulo">Conteúdo em breve.</p>`
    return
  }

  area.innerHTML = `
    <div class="cards-temas">
      ${turma.temas.map((tema, i) => `
        <div class="card-tema" role="button" tabindex="0"
             aria-label="${tema.titulo}"
             onclick="abrirTema(${i})"
             onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();abrirTema(${i})}">
          <div class="icone">📓</div>
          <div class="nome">${tema.titulo}</div>
          <div class="descricao">${tema.descricao}</div>
        </div>
      `).join('')}
    </div>
  `
}

function _abrirFragmentoDoIndice(arquivo, fromPop = false) {
  estado.infoAtual = arquivo
  const match = arquivo.match(/informativo-0*(\d+)\.html$/)
  const numInfo = match ? match[1] : null
  if (numInfo && estado.materiaAtual && estado.turmaAtual) {
    const { materiaAtual: materia, turmaAtual: turma } = estado
    if (!fromPop) {
      history.pushState(
        { view: 'informativo', materiaId: materia.id, turmaId: turma.id, arquivo },
        '',
        BASE_PATH + materia.id + '/' + turma.id + '/' + numInfo
      )
    }
    document.title = `Informativo ${numInfo} — ${turma.titulo} — ${materia.titulo}`
    _atualizarOG(`Informativo ${numInfo} — ${turma.titulo}`)
    atualizarBreadcrumb(`Informativo ${numInfo}`)
  }
  const area = document.getElementById('tab-area-conteudo')
  if (!area) return
  area.innerHTML = skeletonConteudo()
  _fetchComTimeout(SITE_BASE + arquivo)
    .then(r => { if (!r.ok) throw new Error(); return r.text() })
    .then(html => {
      const el = document.getElementById('conteudo-area')
      if (!el) return
      el.innerHTML = html
      el.style.animation = 'none'
      void el.offsetWidth
      el.style.removeProperty('animation')
      linkificarJulgados(el)
    })
    .catch(() => {
      const el = document.getElementById('conteudo-area')
      if (el) el.innerHTML = '<p style="color:#c00">Não foi possível carregar o conteúdo.</p>'
    })
}

function mostrarTabConteudo() {
  document.getElementById('tab-area-conteudo').style.display = ''
  document.getElementById('tab-area-flash').style.display = 'none'
  document.getElementById('tab-conteudo')?.classList.add('ativa')
  document.getElementById('tab-flash')?.classList.remove('ativa')
  document.getElementById('rodape-privacidade')?.setAttribute('hidden', '')
}

// ── Meu Deck (localStorage) ──────────────────────────────

function flashcardsDoAluno(turmaId) {
  try {
    return JSON.parse(localStorage.getItem(`flashcards_${turmaId}`) || '[]')
  } catch {
    return []
  }
}

function salvarFlashcard(turmaId, frente, verso) {
  const cards = flashcardsDoAluno(turmaId)
  cards.push({ id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`, frente: frente.trim(), verso: verso.trim() })
  localStorage.setItem(`flashcards_${turmaId}`, JSON.stringify(cards))
}

function deletarFlashcard(turmaId, id) {
  const cards = flashcardsDoAluno(turmaId).filter(c => c.id !== id)
  localStorage.setItem(`flashcards_${turmaId}`, JSON.stringify(cards))
}

function salvarHistoricoSessao(turmaId, acertos, total) {
  if (!turmaId || typeof acertos !== 'number' || typeof total !== 'number' || total <= 0 || acertos < 0) return
  const key = `flashcards_historico_${turmaId}`
  const historico = carregarHistorico(turmaId)
  historico.unshift({ data: Date.now(), acertos, total })
  if (historico.length > 10) historico.pop()
  localStorage.setItem(key, JSON.stringify(historico))
}

function carregarHistorico(turmaId) {
  try {
    return JSON.parse(localStorage.getItem(`flashcards_historico_${turmaId}`) || '[]')
  } catch { return [] }
}

function calcularTendencia(historico) {
  if (historico.length < 3) return ''
  if (historico[0].total === 0 || historico[1].total === 0 || historico[2].total === 0) return ''
  const ultima = Math.round((historico[0].acertos / historico[0].total) * 100)
  const media = Math.round(
    ((historico[1].acertos / historico[1].total) +
     (historico[2].acertos / historico[2].total)) / 2 * 100
  )
  if (ultima - media >= 5) return '↑'
  if (media - ultima >= 5) return '↓'
  return '→'
}

function formatarDataSessao(ts) {
  const agora = new Date()
  const d = new Date(ts)
  if (isNaN(d.getTime())) return ''
  const mesmoDia = d.toDateString() === agora.toDateString()
  const ontem = new Date(agora)
  ontem.setDate(ontem.getDate() - 1)
  const diaAnterior = d.toDateString() === ontem.toDateString()
  const hhmm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (mesmoDia)    return `Hoje, ${hhmm}`
  if (diaAnterior) return `Ontem, ${hhmm}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}

function renderMeuDeckHTML(turma) {
  const cards = flashcardsDoAluno(turma.id)

  const listaHTML = cards.length > 0
    ? cards.map(c => `
        <div class="flash-card-usuario">
          <div class="flash-card-usuario-corpo">
            <div class="flash-card-usuario-frente">${esc(c.frente)}</div>
            <div class="flash-card-usuario-verso">${esc(c.verso)}</div>
          </div>
          <button class="flash-btn-deletar" onclick="deletarEAtualizar('${esc(turma.id)}', '${esc(c.id)}')" title="Remover card">✕</button>
        </div>
      `).join('')
    : '<p style="font-size:13px;color:var(--text2);margin-bottom:12px">Você ainda não criou nenhum card.</p>'

  return `
    <div class="meu-deck-secao">
      <div class="meu-deck-titulo">Meu Deck</div>
      <div id="meu-deck-lista">${listaHTML}</div>
      <div class="flash-form" id="flash-form">
        <div class="flash-form-titulo">+ Adicionar card</div>
        <textarea class="flash-input" id="flash-novo-frente" placeholder="Pergunta / frente do card" rows="2"></textarea>
        <textarea class="flash-input" id="flash-novo-verso" placeholder="Resposta / verso do card" rows="2"></textarea>
        <div class="flash-form-acoes">
          <button class="flash-btn-cancelar" onclick="limparFormFlash()">Limpar</button>
          <button class="flash-btn-salvar" onclick="adicionarFlashcard('${esc(turma.id)}')">Salvar card</button>
        </div>
      </div>
    </div>
  `
}

function adicionarFlashcard(turmaId) {
  if (!estado.turmaAtual) return
  const frente = document.getElementById('flash-novo-frente')?.value || ''
  const verso  = document.getElementById('flash-novo-verso')?.value || ''
  if (!frente.trim() || !verso.trim()) {
    const form = document.getElementById('flash-form')
    let err = form?.querySelector('.flash-erro')
    if (!err && form) { err = document.createElement('p'); err.className = 'flash-erro'; form.appendChild(err) }
    if (err) err.textContent = 'Preencha a pergunta e a resposta antes de salvar.'
    return
  }
  document.getElementById('flash-form')?.querySelector('.flash-erro')?.remove()
  salvarFlashcard(turmaId, frente, verso)
  renderFlashSessao(estado.turmaAtual)
}

async function deletarEAtualizar(turmaId, id) {
  if (!estado.turmaAtual) return
  if (!await _confirmar('Remover este card?')) return
  deletarFlashcard(turmaId, id)
  renderFlashSessao(estado.turmaAtual)
}

function limparFormFlash() {
  const f = document.getElementById('flash-novo-frente')
  const v = document.getElementById('flash-novo-verso')
  if (f) f.value = ''
  if (v) v.value = ''
}

function renderFlashSessao(turma) {
  const area = document.getElementById('tab-area-flash')
  if (!area) return

  const cardsProf = turma.flashcards || []
  const cardsAluno = flashcardsDoAluno(turma.id)
  const todos = [...cardsProf, ...cardsAluno]

  if (todos.length === 0) {
    area.innerHTML = `
      <div class="flash-sessao" style="text-align:center;padding:32px 16px">
        <div style="font-size:36px;margin-bottom:12px">🃏</div>
        <p style="color:var(--text2);font-size:14px">Nenhum flashcard ainda nesta turma.</p>
      </div>
      ${renderMeuDeckHTML(turma)}
    `
    return
  }

  area.innerHTML = `
    <div class="flash-sessao">
      <div id="flash-sessao-area" data-index="0" data-acertos="0">
        ${renderCardHTML(todos, 0, 0, false)}
      </div>
    </div>
    ${renderMeuDeckHTML(turma)}
  `
}

function renderCardHTML(todos, index, acertos, virado) {
  const card = todos[index]
  const total = todos.length
  const pct = Math.round(((index + 1) / total) * 100)
  const profCount = estado.turmaAtual?.flashcards?.length || 0

  return `
    <div class="flash-deck-header">
      <span class="flash-deck-label">${index < profCount ? 'Deck do Professor' : 'Meu Deck'}</span>
      <span class="flash-contador">Card ${index + 1} de ${total}</span>
    </div>
    <div class="flash-barra-wrap">
      <div class="flash-barra-progresso"><div class="flash-barra-fill" style="width:${pct}%"></div></div>
      <div class="flash-barra-label"><span>Card ${index + 1} de ${total}</span><span>${acertos} acertos</span></div>
    </div>
    <div class="flash-card" role="button" tabindex="0"
         onclick="virarCard()"
         onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();virarCard()}">
      <div class="flash-card-label">${virado ? 'Resposta' : 'Pergunta'}</div>
      <div class="flash-card-texto">${esc(virado ? card.verso : card.frente)}</div>
      ${!virado ? '<div class="flash-card-dica">toque para revelar</div>' : ''}
    </div>
    <div class="flash-acoes">
      ${virado ? `
        <button class="flash-btn flash-btn-nao" onclick="avaliarCard(false)">✗ Não sabia</button>
        <button class="flash-btn flash-btn-sim" onclick="avaliarCard(true)">✓ Sabia!</button>
      ` : `
        <button class="flash-btn flash-btn-ver" onclick="event.stopPropagation();virarCard()">Ver resposta</button>
      `}
    </div>
  `
}

function virarCard() {
  const area = document.getElementById('flash-sessao-area')
  if (!area) return
  const turma = estado.turmaAtual
  if (!turma) return
  const todos = [...(turma.flashcards || []), ...flashcardsDoAluno(turma.id)]
  const index = parseInt(area.dataset.index || '0')
  const acertos = parseInt(area.dataset.acertos || '0')
  area.innerHTML = renderCardHTML(todos, index, acertos, true)
  area.dataset.index = index
  area.dataset.acertos = acertos
}

function avaliarCard(acertou) {
  const area = document.getElementById('flash-sessao-area')
  if (!area) return
  const turma = estado.turmaAtual
  if (!turma) return
  const todos = [...(turma.flashcards || []), ...flashcardsDoAluno(turma.id)]
  const index = parseInt(area.dataset.index || '0')
  const acertos = parseInt(area.dataset.acertos || '0') + (acertou ? 1 : 0)
  const proximo = index + 1

  if (proximo >= todos.length) {
    salvarHistoricoSessao(turma.id, acertos, todos.length)
    area.innerHTML = renderFlashResumoHTML(acertos, todos.length, turma.id)
    return
  }

  area.innerHTML = renderCardHTML(todos, proximo, acertos, false)
  area.dataset.index = proximo
  area.dataset.acertos = acertos
}

function renderFlashResumoHTML(acertos, total, turmaId) {
  const pct = Math.round((acertos / total) * 100)
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📖'
  const msg = pct >= 80
    ? 'Ótimo desempenho! Você está bem preparado.'
    : pct >= 50
      ? 'Bom progresso! Revise os cards que errou.'
      : 'Mais uma rodada vai ajudar. Continue!'

  const historico = turmaId ? carregarHistorico(turmaId) : []
  const tendencia = calcularTendencia(historico)
  const ultimas = historico.slice(0, 5)

  const historicoHTML = ultimas.length === 0 ? '' : `
    <div class="flash-historico">
      <div class="flash-historico-titulo">Suas últimas sessões</div>
      ${ultimas.map((s, i) => {
        const spct = s.total > 0 ? Math.round((s.acertos / s.total) * 100) : 0
        const trend = i === 0 && tendencia
          ? `<span class="flash-trend flash-trend-${tendencia === '↑' ? 'up' : tendencia === '↓' ? 'down' : 'flat'}">${tendencia}</span>`
          : '<span class="flash-trend"></span>'
        return `
          <div class="flash-historico-linha">
            ${trend}
            <span class="flash-hist-data">${formatarDataSessao(s.data)}</span>
            <span class="flash-hist-pct">${spct}%</span>
            <span class="flash-hist-cards">${s.total} cards</span>
          </div>`
      }).join('')}
    </div>
  `

  return `
    <div class="flash-resumo">
      <div class="flash-resumo-emoji">${emoji}</div>
      <div class="flash-resumo-titulo">${acertos} de ${total} acertos (${pct}%)</div>
      <div class="flash-resumo-sub">${msg}</div>
      <button class="flash-resumo-btn" onclick="reiniciarSessao()">Reiniciar sessão</button>
      ${historicoHTML}
    </div>
  `
}

function reiniciarSessao() {
  const area = document.getElementById('tab-area-flash')
  if (area) {
    area.innerHTML = ''
    renderFlashSessao(estado.turmaAtual)
  }
}

function mostrarTabFlash() {
  document.getElementById('tab-area-conteudo').style.display = 'none'
  const flashArea = document.getElementById('tab-area-flash')
  if (flashArea) flashArea.style.display = ''
  document.getElementById('tab-conteudo')?.classList.remove('ativa')
  document.getElementById('tab-flash')?.classList.add('ativa')
  if (flashArea && !flashArea.hasChildNodes()) renderFlashSessao(estado.turmaAtual)
  document.getElementById('rodape-privacidade')?.removeAttribute('hidden')
}

function executarScripts(container) {
  container.querySelectorAll('script').forEach(oldScript => {
    const newScript = document.createElement('script')
    Array.from(oldScript.attributes).forEach(attr =>
      newScript.setAttribute(attr.name, attr.value)
    )
    newScript.textContent = oldScript.textContent
    oldScript.parentNode.replaceChild(newScript, oldScript)
  })
}

function ativarTabDoElemento(el) {
  const isPainel = n => n.id && (n.className.includes('-painel') || n.className.includes('tab-content'))
  const isAtivo  = n => n.classList.contains('ativo') || n.classList.contains('active')
  let panel = isPainel(el) ? el : null
  if (!panel) {
    let node = el.parentElement
    while (node && node !== document.body) {
      if (isPainel(node)) { panel = node; break }
      node = node.parentElement
    }
  }
  if (!panel || isAtivo(panel)) return
  const btn = document.querySelector(`[onclick*="${panel.id}"]`)
  if (btn) btn.click()
}

function rolarParaAncora() {
  const hash = window.location.hash
  if (!hash) return
  const alvo = document.getElementById(hash.slice(1))
  if (!alvo) return
  ativarTabDoElemento(alvo)
  const reduzirMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  requestAnimationFrame(() =>
    alvo.scrollIntoView({ behavior: reduzirMov ? 'auto' : 'smooth', block: 'start' })
  )
}

function abrirTemaDaArvore(materiaId, turmaId, temaIndex) {
  const materia = materias.find(m => m.id === materiaId)
  if (!materia) { console.error('abrirTemaDaArvore: matéria não encontrada', materiaId); return }
  const turma = materia.turmas.find(t => t.id === turmaId)
  if (!turma)  { console.error('abrirTemaDaArvore: turma não encontrada', turmaId); return }
  estado.materiaAtual = materia
  estado.turmaAtual   = turma
  abrirTema(temaIndex)
}

function abrirTema(index, fromPop = false) {
  const tema = estado.turmaAtual.temas[index]
  document.title = `${tema.titulo} — ${estado.turmaAtual.titulo}`
  atualizarBreadcrumb(tema.titulo)
  _atualizarOG(`${tema.titulo} — ${estado.turmaAtual.titulo}`, tema.descricao)
  const _temaSlug = tema.arquivo.replace('conteudo/', '').replace('.html', '')
  if (!fromPop) history.pushState({
    view: 'tema',
    materiaId: estado.materiaAtual.id,
    turmaId: estado.turmaAtual.id,
    temaIndex: index
  }, '', BASE_PATH + _temaSlug)
  window.scrollTo(0, 0)

  app.innerHTML = skeletonConteudo()

  const base = SITE_BASE + tema.arquivo.substring(0, tema.arquivo.lastIndexOf('/') + 1)

  _fetchComTimeout(SITE_BASE + tema.arquivo)
    .then(r => {
      if (!r.ok) throw new Error('Arquivo não encontrado')
      return r.text()
    })
    .then(html => {
      const area = document.getElementById('conteudo-area')
      area.innerHTML = html
      // restaura animação de entrada (o skeleton a desligava com inline style)
      area.style.animation = 'none'
      void area.offsetWidth  // força reflow para reiniciar a animação
      area.style.removeProperty('animation')
      // corrige caminhos relativos de imagens e iframes injetados via fetch
      area.querySelectorAll('img[src]').forEach(el => {
        const s = el.getAttribute('src')
        if (s && !s.startsWith('http') && !s.startsWith('/') && !s.startsWith('data:')) {
          el.src = base + s
        }
      })
      area.querySelectorAll('iframe[src]').forEach(el => {
        const s = el.getAttribute('src')
        if (s && !s.startsWith('http') && !s.startsWith('/')) {
          el.src = base + s
        }
      })
      area.querySelectorAll('a[href]').forEach(el => {
        const s = el.getAttribute('href')
        if (s && !s.startsWith('http') && !s.startsWith('#') && !s.startsWith('/')) {
          el.href = base + s
        }
      })
      // Âncoras internas (#seção): scroll suave sem alterar hash da URL
      // (evita que o popstate interprete o estado como nulo e volte à tela inicial)
      area.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault()
          const id = a.getAttribute('href').slice(1)
          const target = document.getElementById(id)
          if (target) {
            const headerH = document.querySelector('header')?.offsetHeight ?? 0
            const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
          }
        })
      })
      linkificarJulgados(area)
      // Injeta aba "Meu Espaço" se a página tem sistema de abas
      if (typeof MeuEspaco !== 'undefined') {
        MeuEspaco.init(area, tema.arquivo)
      }
      // Botão de download para imagens (infográficos, mapas mentais)
      area.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href')
        if (!href || !/\.(png|jpg|jpeg|webp|gif)$/i.test(href)) return
        if (!link.querySelector('img')) return

        const filename = href.split('/').pop()
        const wrap = document.createElement('div')
        wrap.className = 'img-download-wrap'
        wrap.innerHTML = `
          <a class="btn-download-img" href="${esc(href)}" download="${esc(filename)}">
            ⬇ Baixar imagem
          </a>
        `
        if (link.parentElement) link.parentElement.appendChild(wrap)
      })
      // Cabeçalho de identidade para impressão (oculto na tela)
      const printHeader = document.createElement('div')
      printHeader.id = 'print-header'
      printHeader.innerHTML = `
        <div id="print-header-site">Estudos Complementares — Prof. Artur Vieira</div>
        <div id="print-header-titulo">${esc(tema.titulo)}</div>
        <div id="print-header-turma">${esc(estado.turmaAtual.titulo)}</div>
      `
      area.insertBefore(printHeader, area.firstChild)

      // Botão de download
      const downloadWrap = document.createElement('div')
      downloadWrap.className = 'btn-download-wrap'
      downloadWrap.innerHTML = `
        <button class="btn-download-pdf" onclick="window.print()">
          ⬇ Salvar como PDF
        </button>
      `
      area.appendChild(downloadWrap)

      executarScripts(area)
      rolarParaAncora()
    })
    .catch(() => {
      document.getElementById('conteudo-area').innerHTML =
        `<p style="color:#c00">Não foi possível carregar o conteúdo. Tente recarregar a página.</p>`
    })
}

// ── Breadcrumb ───────────────────────────────────────────

function atualizarBreadcrumb(tituloTema) {
  const partes = []

  partes.push(`<button class="crumb" onclick="renderArvore()">Início</button>`)

  if (estado.materiaAtual) {
    partes.push(`<span class="sep">›</span>`)
    if (estado.turmaAtual || tituloTema) {
      partes.push(`<button class="crumb" onclick="selecionarMateria('${estado.materiaAtual.id}')">${estado.materiaAtual.titulo}</button>`)
    } else {
      partes.push(`<span class="crumb-atual">${estado.materiaAtual.titulo}</span>`)
    }
  }

  if (estado.turmaAtual) {
    partes.push(`<span class="sep">›</span>`)
    if (tituloTema) {
      partes.push(`<button class="crumb" onclick="selecionarTurma('${estado.materiaAtual.id}','${estado.turmaAtual.id}')">${estado.turmaAtual.titulo}</button>`)
    } else {
      partes.push(`<span class="crumb-atual">${estado.turmaAtual.titulo}</span>`)
    }
  }

  if (tituloTema) {
    partes.push(`<span class="sep">›</span>`)
    partes.push(`<span class="crumb-atual">${tituloTema}</span>`)
  }

  breadcrumb.innerHTML = partes.join('')
}

// ── Sobre mim ────────────────────────────────────────────

function abrirSobre(fromPop = false) {
  estado.materiaAtual = null
  estado.turmaAtual   = null
  document.title = 'Sobre mim — Prof. Artur Vieira'
  atualizarBreadcrumb('Sobre mim')
  _atualizarOG('Sobre mim')
  if (!fromPop) history.pushState({ view: 'sobre' }, '', BASE_PATH + 'sobre')
  window.scrollTo(0, 0)

  app.innerHTML = skeletonSobre()

  _fetchComTimeout(SITE_BASE + 'sobre.html')
    .then(r => { if (!r.ok) throw new Error(); return r.text() })
    .then(html => {
      app.innerHTML = html
      // intercepta o link "Voltar" para não sair do SPA
      app.querySelectorAll('a[href="index.html"]').forEach(a => {
        a.href = '#'
        a.onclick = (e) => { e.preventDefault(); renderArvore() }
      })
      executarScripts(app)
    })
    .catch(() => {
      app.innerHTML = '<p style="color:#c00;padding:2rem">Não foi possível carregar a página.</p>'
    })
}

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
          temaIndex: i,
          arquivo:   tema.arquivo,
        })
      })
    }
  }

  const parser = new DOMParser()
  window._searchIndex = await Promise.all(
    entradas.map(async entrada => {
      try {
        const r = await fetch(SITE_BASE + entrada.arquivo)
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
               onclick="navegarParaResultado('${esc(r.materiaId)}','${esc(r.turmaId)}',${parseInt(r.temaIndex,10)})"
               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();navegarParaResultado('${esc(r.materiaId)}','${esc(r.turmaId)}',${parseInt(r.temaIndex,10)})}">
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

function navegarParaResultado(materiaId, turmaId, temaIndex) {
  fecharBusca()
  abrirTemaDaArvore(materiaId, turmaId, temaIndex)
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

function _onAppClick(e) {
  const wrap  = document.getElementById('busca-input-wrap')
  const painel = document.getElementById('busca-painel')
  if (!wrap.contains(e.target) && !painel.contains(e.target)) fecharBusca()
}

async function abrirBusca() {
  const btn   = document.getElementById('busca-btn')
  const wrap  = document.getElementById('busca-input-wrap')
  const input = document.getElementById('busca-input')

  input.removeEventListener('input', _onBuscaInput)
  document.removeEventListener('keydown', _onEscBusca)
  document.removeEventListener('click', _onAppClick)
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
  // Defer to let the current click event finish propagating before we listen
  // for outside clicks — otherwise the btn click that opened the search would
  // immediately trigger _onAppClick and close it again (race on 2nd+ open).
  setTimeout(() => document.addEventListener('click', _onAppClick), 0)
}

function fecharBusca() {
  const btn    = document.getElementById('busca-btn')
  const wrap   = document.getElementById('busca-input-wrap')
  const input  = document.getElementById('busca-input')
  const painel = document.getElementById('busca-painel')

  input.removeEventListener('input', _onBuscaInput)
  document.removeEventListener('keydown', _onEscBusca)
  document.removeEventListener('click', _onAppClick)
  clearTimeout(_buscaTimer)

  input.value = ''
  wrap.setAttribute('hidden', '')
  btn.removeAttribute('hidden')
  painel.setAttribute('hidden', '')
  painel.innerHTML = ''
  document.getElementById('app').classList.remove('busca-ativa')
}

// ── Julgados ──────────────────────────────────────────────

function _detectarTribunal(text, matchIdx, fallback) {
  const chunk = text.slice(Math.max(0, matchIdx - 60), Math.min(text.length, matchIdx + 80)).toUpperCase()
  if (/\bSTF\b/.test(chunk)) return 'stf'
  if (/\bSTJ\b/.test(chunk)) return 'stj'
  return fallback
}

function _urlJulgado({ tribunal, tipo, m }) {
  const g = m.groups
  const num = (g.num || '').replace(/\./g, '')
  if (tipo === 'sumula')
    return `https://scon.stj.jus.br/SCON/pesquisar.jsp?b=SUMU&livre=S%FAmula+${num}`
  if (tipo === 'sumula_stf')
    return `https://jurisprudencia.stf.jus.br/pages/search?base=sumulas&sinonimo=true&plural=true&queryString=S%C3%BAmula+${num}`
  if (tipo === 'sumula_pre') {
    if ((g.court || '').toUpperCase() === 'STF')
      return `https://jurisprudencia.stf.jus.br/pages/search?base=sumulas&sinonimo=true&plural=true&queryString=S%C3%BAmula+${num}`
    return `https://scon.stj.jus.br/SCON/pesquisar.jsp?b=SUMU&livre=S%FAmula+${num}`
  }
  if (tipo === 'sv')
    return `https://jurisprudencia.stf.jus.br/pages/search?base=sumulas&sinonimo=true&plural=true&queryString=S%C3%BAmula+Vinculante+${num}`
  if (tipo === 'tema') {
    const court = ((g.court || '').toUpperCase()) || (tribunal || '').toUpperCase()
    if (court === 'STJ')
      return `https://processo.stj.jus.br/repetitivos/temas_repetitivos/pesquisa.jsp?tipo=tabela&cod=${num}`
    return `https://jurisprudencia.stf.jus.br/pages/search?queryString=Tema+${num}`
  }
  if (tribunal === 'stj')
    return `https://www.google.com/search?q=STJ+${encodeURIComponent('"' + m[0].trim() + '"')}`
  const t = encodeURIComponent((g.tipo || '').replace(/-\w+$/, ''))
  return `https://jurisprudencia.stf.jus.br/pages/search?queryString=${t}+${num}`
}


function linkificarJulgados(el) {
  if (!el) return
  const PX = '(?:(?:AgRg|AgInt|EDcl|EDiv|QO)\\s+n[ao]s?\\s+)?'
  const NM = '(?<num>\\d[\\d.]*\\d|\\d)(?:\\s*[-/]\\s*[A-Z]{2})?'
  const PADROES = [
    { re: new RegExp(`\\b${PX}(?<tipo>REsp|AREsp|RHC|EREsp)\\s+${NM}`, 'g'), tribunal: 'stj' },
    { re: new RegExp(`\\b${PX}(?<tipo>ADI|ADC|ADPF|ARE|MI|RCL|Rcl|RCl)\\s+${NM}`, 'g'), tribunal: 'stf' },
    { re: new RegExp(`\\b${PX}(?<tipo>HC)\\s+${NM}`, 'g'),  tribunal: null, fallback: 'stj' },
    { re: new RegExp(`\\b${PX}(?<tipo>RE(?:-(?:AgR|AgRg|ED|EDj|MC|RG))?)\\s+${NM}`, 'g'), tribunal: null, fallback: 'stf' },
    { re: new RegExp(`\\b${PX}(?<tipo>MS)\\s+${NM}`, 'g'),  tribunal: null, fallback: 'stf' },
    { re: /S[uú]m(?:ula)?\.?\s+n?[ºo°.]?\s*(?<num>\d+)\s+(?:do\s+)?STJ/g, tribunal: 'stj', tipo: 'sumula' },
    { re: /S[uú]m(?:ula)?\.?\s+n?[ºo°.]?\s*(?<num>\d+)\s+(?:do\s+)?STF/g, tribunal: 'stf', tipo: 'sumula_stf' },
    { re: /(?<court>STJ|STF)\s*[·—]\s*S[uú]m(?:ula)?\s+(?<num>\d+)/g,      tribunal: null,  tipo: 'sumula_pre' },
    { re: /\bSV\s+(?<num>\d+)\b/g,                                           tribunal: 'stf', tipo: 'sv' },
    { re: /S[uú]mula\s+Vinculante\s+n?[ºo°.]?\s*(?<num>\d+)/g,              tribunal: 'stf', tipo: 'sv' },
    { re: /Tema\s+(?<num>\d+)\s+(?:do\s+)?(?<court>STJ|STF)/g,              tribunal: null,  tipo: 'tema' },
    { re: /Tema\s+Repetitivo\s+(?<num>\d+)(?:\s+(?:do\s+)?(?<court>STJ|STF))?/g, tribunal: null, tipo: 'tema' },
  ]
  const SKIP = new Set(['A', 'CODE', 'SCRIPT', 'STYLE', 'PRE'])
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p = node.parentElement
      while (p && p !== el) {
        if (SKIP.has(p.tagName)) return NodeFilter.FILTER_SKIP
        p = p.parentElement
      }
      return NodeFilter.FILTER_ACCEPT
    }
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    const text = node.nodeValue
    const hits = []
    for (const { re, tribunal, fallback, tipo } of PADROES) {
      re.lastIndex = 0
      let m
      while ((m = re.exec(text)) !== null) {
        const s = m.index, e = m.index + m[0].length
        if (hits.some(h => h.s < e && h.e > s)) continue
        const trib = tribunal ?? _detectarTribunal(text, s, fallback ?? 'stj')
        hits.push({ s, e, raw: m[0], tribunal: trib, tipo: tipo ?? 'acordao', m })
      }
    }
    if (!hits.length) continue
    hits.sort((a, b) => a.s - b.s)
    const frag = document.createDocumentFragment()
    let cur = 0
    for (const h of hits) {
      if (h.s > cur) frag.appendChild(document.createTextNode(text.slice(cur, h.s)))
      const a = document.createElement('a')
      a.className   = 'julgado-link'
      a.textContent = h.raw
      a.target      = '_blank'
      a.rel         = 'noopener noreferrer'
      a.href  = _urlJulgado(h)
      a.title = `Ver no ${(h.m.groups?.court || h.tribunal).toUpperCase()}`
      frag.appendChild(a)
      cur = h.e
    }
    if (cur < text.length) frag.appendChild(document.createTextNode(text.slice(cur)))
    node.parentNode.replaceChild(frag, node)
  }
}

// ── PWA install prompt ──────────────────────────────────
let _pwaPrompt = null

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault()
  _pwaPrompt = e
  const banner = document.getElementById('pwa-banner')
  if (banner) banner.hidden = false
})

function pwaBannerInstalar() {
  if (!_pwaPrompt) return
  _pwaPrompt.prompt()
  _pwaPrompt.userChoice.then(() => {
    _pwaPrompt = null
    pwaBannerDispensar()
  })
}

function pwaBannerDispensar() {
  const banner = document.getElementById('pwa-banner')
  if (banner) banner.hidden = true
}

window.addEventListener('appinstalled', () => {
  _pwaPrompt = null
  pwaBannerDispensar()
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js')
  })
}
