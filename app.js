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


// ── Estado ──────────────────────────────────────────────
const estado = { materiaAtual: null, turmaAtual: null }

// ── Referências DOM ─────────────────────────────────────
const app        = document.getElementById('app')
const breadcrumb = document.getElementById('breadcrumb')

// ── Inicialização ────────────────────────────────────────
history.replaceState({ view: 'materias' }, '')
renderArvore(true)

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
  if (!fromPop) history.pushState({ view: 'materias' }, '')
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
  if (!fromPop) history.pushState({ view: 'materia', materiaId: id }, '')
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

function selecionarTurma(materiaId, turmaId, fromPop = false) {
  const materia = materias.find(m => m.id === materiaId)
  const turma   = materia.turmas.find(t => t.id === turmaId)
  estado.materiaAtual = materia
  estado.turmaAtual   = turma
  document.title = `${turma.titulo} — ${materia.titulo}`
  atualizarBreadcrumb()
  if (!fromPop) history.pushState({ view: 'turma', materiaId, turmaId }, '')
  window.scrollTo(0, 0)

  const temFlashcards = turma.flashcards && turma.flashcards.length > 0

  app.innerHTML = `
    <p class="secao-titulo">${turma.titulo}</p>
    ${temFlashcards ? `
      <div class="turma-tabs" id="turma-tabs">
        <button class="turma-tab ativa" id="tab-conteudo" onclick="mostrarTabConteudo()">📚 Conteúdo</button>
        <button class="turma-tab" id="tab-flash" onclick="mostrarTabFlash()">🃏 Flashcards</button>
      </div>
    ` : ''}
    <div id="tab-area-conteudo"></div>
    <div id="tab-area-flash" style="display:none"></div>
  `

  renderConteudoTurma(turma)
}

function renderConteudoTurma(turma) {
  const area = document.getElementById('tab-area-conteudo')
  if (!area) return

  if (turma.indice) {
    area.innerHTML = skeletonConteudo()
    fetch(turma.indice)
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
            }
          }
        })
      })
      .catch(() => {
        const el = document.getElementById('conteudo-area')
        if (el) el.innerHTML = `<p style="color:#c00">Não foi possível carregar o índice.<br>Verifique se o arquivo <code>${turma.indice}</code> existe.</p>`
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

function mostrarTabConteudo() {
  document.getElementById('tab-area-conteudo').style.display = ''
  document.getElementById('tab-area-flash').style.display = 'none'
  document.getElementById('tab-conteudo')?.classList.add('ativa')
  document.getElementById('tab-flash')?.classList.remove('ativa')
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
    alert('Preencha a pergunta e a resposta antes de salvar.')
    return
  }
  salvarFlashcard(turmaId, frente, verso)
  renderFlashSessao(estado.turmaAtual)
}

function deletarEAtualizar(turmaId, id) {
  if (!estado.turmaAtual) return
  if (!confirm('Remover este card?')) return
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
    area.innerHTML = renderFlashResumoHTML(acertos, todos.length)
    return
  }

  area.innerHTML = renderCardHTML(todos, proximo, acertos, false)
  area.dataset.index = proximo
  area.dataset.acertos = acertos
}

function renderFlashResumoHTML(acertos, total) {
  const pct = Math.round((acertos / total) * 100)
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📖'
  const msg = pct >= 80
    ? 'Ótimo desempenho! Você está bem preparado.'
    : pct >= 50
      ? 'Bom progresso! Revise os cards que errou.'
      : 'Mais uma rodada vai ajudar. Continue!'

  return `
    <div class="flash-resumo">
      <div class="flash-resumo-emoji">${emoji}</div>
      <div class="flash-resumo-titulo">${acertos} de ${total} acertos (${pct}%)</div>
      <div class="flash-resumo-sub">${msg}</div>
      <button class="flash-resumo-btn" onclick="reiniciarSessao()">Reiniciar sessão</button>
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
  if (!fromPop) history.pushState({
    view: 'tema',
    materiaId: estado.materiaAtual.id,
    turmaId: estado.turmaAtual.id,
    temaIndex: index
  }, '')
  window.scrollTo(0, 0)

  app.innerHTML = skeletonConteudo()

  const base = tema.arquivo.substring(0, tema.arquivo.lastIndexOf('/') + 1)

  fetch(tema.arquivo)
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
            window.scrollTo({ top, behavior: 'smooth' })
          }
        })
      })
      executarScripts(area)
    })
    .catch(() => {
      document.getElementById('conteudo-area').innerHTML =
        `<p style="color:#c00">Não foi possível carregar o conteúdo.<br>
         Verifique se o arquivo <code>${tema.arquivo}</code> existe.</p>`
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
  if (!fromPop) history.pushState({ view: 'sobre' }, '')
  window.scrollTo(0, 0)

  app.innerHTML = skeletonSobre()

  fetch('sobre.html')
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
