#!/usr/bin/env node
/**
 * Gera sitemap.xml na raiz do projeto a partir de data.js.
 * Uso: node scripts/gerar-sitemap.js
 *
 * GitHub Action sugerida (.github/workflows/sitemap.yml):
 * ---
 * name: Atualizar sitemap
 * on:
 *   push:
 *     paths: ['data.js']
 * jobs:
 *   sitemap:
 *     runs-on: ubuntu-latest
 *     steps:
 *       - uses: actions/checkout@v4
 *       - uses: actions/setup-node@v4
 *         with: { node-version: '20' }
 *       - run: node scripts/gerar-sitemap.js
 *       - uses: stefanzweifel/git-auto-commit-action@v5
 *         with:
 *           commit_message: 'chore: atualiza sitemap.xml'
 *           file_pattern: sitemap.xml
 * ---
 */

'use strict'

const fs   = require('fs')
const path = require('path')
const vm   = require('vm')

const ROOT    = path.join(__dirname, '..')
const BASE    = 'https://prof-artur-vieira.github.io/estudos-direito'
const TODAY   = new Date().toISOString().slice(0, 10)
const OUT     = path.join(ROOT, 'sitemap.xml')

// Carrega data.js sem import/require — compatível com script vanilla
// `const` não é exposto no contexto vm; reescreve para `var` antes de executar
const src = fs.readFileSync(path.join(ROOT, 'data.js'), 'utf8')
              .replace(/\bconst\s+materias\b/, 'var materias')
const ctx = {}
vm.createContext(ctx)
vm.runInContext(src, ctx)
const materias = ctx.materias

// Monta lista de URLs
const urls = []

const add = (loc, priority, changefreq = 'monthly') =>
  urls.push({ loc: `${BASE}/${loc}`, priority, changefreq, lastmod: TODAY })

add('', 1.0)
add('sobre.html', 0.6)

for (const mat of materias) {
  for (const turma of mat.turmas) {
    if (turma.indice) add(turma.indice, 0.7)
    for (const tema of turma.temas || []) {
      if (tema.arquivo) add(tema.arquivo, 0.8)
    }
  }
}

// Serializa XML
const esc = s => s.replace(/&/g, '&amp;')

const xml = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...urls.map(u => [
    '  <url>',
    `    <loc>${esc(u.loc)}</loc>`,
    `    <lastmod>${u.lastmod}</lastmod>`,
    `    <changefreq>${u.changefreq}</changefreq>`,
    `    <priority>${u.priority.toFixed(1)}</priority>`,
    '  </url>',
  ].join('\n')),
  '</urlset>',
].join('\n')

fs.writeFileSync(OUT, xml + '\n', 'utf8')
console.log(`sitemap.xml gerado com ${urls.length} URLs → ${OUT}`)
