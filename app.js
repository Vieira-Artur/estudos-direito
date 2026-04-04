// ── Estado ──────────────────────────────────────────────
const estado = { materiaAtual: null, turmaAtual: null }

// ── Referências DOM ─────────────────────────────────────
const app        = document.getElementById('app')
const breadcrumb = document.getElementById('breadcrumb')

// ── Inicialização ────────────────────────────────────────
renderMaterias()

// ── Renderização ─────────────────────────────────────────

function renderMaterias() {
  estado.materiaAtual = null
  estado.turmaAtual   = null
  atualizarBreadcrumb()

  app.innerHTML = `
    <p class="secao-titulo">Selecione uma matéria</p>
    <div class="cards-materias">
      ${materias.map(m => `
        <div class="card-materia" onclick="selecionarMateria('${m.id}')">
          <div class="icone">${m.icone}</div>
          <div class="nome">${m.titulo}</div>
        </div>
      `).join('')}
    </div>
  `
}

function selecionarMateria(id) {
  const materia = materias.find(m => m.id === id)
  estado.materiaAtual = materia
  estado.turmaAtual   = null
  atualizarBreadcrumb()

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

function selecionarTurma(materiaId, turmaId) {
  const materia = materias.find(m => m.id === materiaId)
  const turma   = materia.turmas.find(t => t.id === turmaId)
  estado.turmaAtual = turma
  atualizarBreadcrumb()

  if (turma.indice) {
    app.innerHTML = `<div id="conteudo-area"><p style="color:#888;font-size:13px">Carregando...</p></div>`
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

function abrirTema(index) {
  const tema = estado.turmaAtual.temas[index]
  atualizarBreadcrumb(tema.titulo)

  app.innerHTML = `<div id="conteudo-area"><p style="color:#888;font-size:13px">Carregando...</p></div>`

  fetch(tema.arquivo)
    .then(r => {
      if (!r.ok) throw new Error('Arquivo não encontrado')
      return r.text()
    })
    .then(html => {
      document.getElementById('conteudo-area').innerHTML = html
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

  partes.push(`<button class="crumb" onclick="renderMaterias()">Início</button>`)

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

  breadcrumb.innerHTML = partes.join('')}
