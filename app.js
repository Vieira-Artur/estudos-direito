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
    <div style="background:linear-gradient(135deg,#162f52 0%,#1F497D 100%);border-bottom:2px solid var(--gold);padding:2.2rem 2rem;display:flex;align-items:center;gap:2rem;flex-wrap:wrap">
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
  document.title = 'Estudos Complementares — Direito'
  atualizarBreadcrumb()
  if (!fromPop) history.pushState({ view: 'materias' }, '')

  app.innerHTML = `
    <div class="arvore">
      ${materias.map(m => `
        <div class="ramo">
          <div class="no-materia">${m.icone} ${m.titulo}</div>
          <div class="conector-v" style="height:14px"></div>
          <div class="turmas-lista">
            ${m.turmas.length === 0
              ? '<div class="no-turma vazia">Em breve</div>'
              : m.turmas.map(t => `
                  <div class="no-turma-wrap">
                    ${t.temas.length > 0
                      ? `<div class="no-turma">${t.titulo}</div>
                         <div class="conector-v" style="height:10px"></div>
                         <div class="temas-lista">
                           ${t.temas.map((tema, i) => `
                             <div class="no-tema" onclick="abrirTemaDaArvore('${m.id}','${t.id}',${i})">
                               ${tema.titulo}
                               <span class="tag">${tema.descricao}</span>
                             </div>
                           `).join('')}
                         </div>`
                      : `<div class="no-turma vazia">${t.titulo}<br><span style="font-size:12px">(em breve)</span></div>`
                    }
                  </div>
                `).join('')
            }
          </div>
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

  if (materia.turmas.length === 0) {
    app.innerHTML = `<p class="secao-titulo">Nenhuma turma cadastrada ainda para ${materia.titulo}.</p>`
    return
  }

  app.innerHTML = `
    <p class="secao-titulo">${materia.titulo} — Selecione a turma</p>
    <div class="cards-turmas">
      ${materia.turmas.map(t => `
        <div class="card-turma" onclick="selecionarTurma('${materia.id}', '${t.id}')">
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

  if (turma.indice) {
    app.innerHTML = skeletonConteudo()
    fetch(turma.indice)
      .then(r => {
        if (!r.ok) throw new Error('Arquivo não encontrado')
        return r.text()
      })
      .then(html => {
        const area = document.getElementById('conteudo-area')
        area.innerHTML = html
        const base = turma.indice.substring(0, turma.indice.lastIndexOf('/') + 1)
        area.querySelectorAll('a[href]').forEach(a => {
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
        document.getElementById('conteudo-area').innerHTML =
          `<p style="color:#c00">Não foi possível carregar o índice.<br>
           Verifique se o arquivo <code>${turma.indice}</code> existe.</p>`
      })
    return
  }

  app.innerHTML = `
    <p class="secao-titulo">${turma.titulo} — Selecione o tema</p>
    <div class="cards-temas">
      ${turma.temas.map((tema, i) => `
        <div class="card-tema" onclick="abrirTema(${i})">
          <div class="icone">📓</div>
          <div class="nome">${tema.titulo}</div>
          <div class="descricao">${tema.descricao}</div>
        </div>
      `).join('')}
    </div>
  `
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
