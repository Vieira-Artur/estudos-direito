'use strict'
/**
 * Enumeração central das rotas do SPA — usada por gerar-sitemap.js e
 * gerar-rotas-estaticas.js para que sitemap e páginas-casca nunca divirjam.
 */

const fs   = require('fs')
const path = require('path')
const vm   = require('vm')

const ROOT = path.join(__dirname, '..')
const BASE = 'https://vieira-artur.github.io/estudos-direito'

const TITULO_BASE = 'Estudos Complementares — Prof. Artur Vieira'
const DESC_PADRAO = 'Material de estudos complementares de Direito — Prof. Artur Vieira. Penal, Processual Penal, Tributário e mais.'

// Carrega data.js sem import/require — compatível com script vanilla.
// `const` não é exposto no contexto vm; reescreve para `var` antes de executar.
function carregarMaterias() {
  const src = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8')
                .replace(/\bconst\s+materias\b/, 'var materias')
  const ctx = {}
  vm.createContext(ctx)
  vm.runInContext(src, ctx)
  return ctx.materias
}

/**
 * Retorna [{ caminho, titulo, descricao, prioridade, changefreq }].
 * caminho '' é a raiz. Informativos individuais (numéricos) ficam de fora:
 * são semanais e continuam atendidos pelo fallback do 404.html.
 */
function listarRotas(materias) {
  const rotas = []
  rotas.push({ caminho: '', titulo: TITULO_BASE, descricao: DESC_PADRAO, prioridade: 1.0, changefreq: 'weekly' })
  rotas.push({ caminho: 'sobre', titulo: `Sobre mim — ${TITULO_BASE}`, descricao: 'Currículo e trajetória do Prof. Artur Vieira — Mestre em Direito, professor e advogado.', prioridade: 0.6, changefreq: 'monthly' })

  for (const mat of materias) {
    rotas.push({
      caminho: mat.id,
      titulo: `${mat.titulo} — ${TITULO_BASE}`,
      descricao: DESC_PADRAO,
      prioridade: 0.6,
      changefreq: 'monthly',
    })
    for (const turma of mat.turmas) {
      if (turma.emBreve) continue
      const ehInformativos = /-informativos-stj$/.test(turma.id)
      rotas.push({
        caminho: `${mat.id}/${turma.id}`,
        titulo: `${turma.titulo} — ${mat.titulo}`,
        descricao: ehInformativos
          ? `Informativos de jurisprudência do STJ em ${mat.titulo}, atualizados semanalmente.`
          : DESC_PADRAO,
        prioridade: 0.7,
        changefreq: ehInformativos ? 'weekly' : 'monthly',
      })
      for (const tema of turma.temas || []) {
        if (!tema.arquivo) continue
        rotas.push({
          caminho: tema.arquivo.replace('conteudo/', '').replace('.html', ''),
          titulo: `${tema.titulo} — ${turma.titulo}`,
          descricao: (tema.descricao || DESC_PADRAO).replace(/\s+·\s+/g, ' · '),
          prioridade: 0.8,
          changefreq: 'monthly',
        })
      }
    }
  }
  return rotas
}

module.exports = { ROOT, BASE, TITULO_BASE, DESC_PADRAO, carregarMaterias, listarRotas }
