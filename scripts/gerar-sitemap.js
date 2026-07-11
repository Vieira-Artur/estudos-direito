#!/usr/bin/env node
/**
 * Gera sitemap.xml na raiz do projeto a partir das rotas do SPA (scripts/rotas.js).
 * As URLs listadas são as rotas amigáveis (ex.: /penal/penal-iv/01-fe-publica),
 * que respondem 200 graças às páginas-casca de gerar-rotas-estaticas.js —
 * rode os dois juntos após alterar data.js:
 *   node scripts/gerar-rotas-estaticas.js && node scripts/gerar-sitemap.js
 */

'use strict'

const fs   = require('fs')
const path = require('path')
const { ROOT, BASE, carregarMaterias, listarRotas } = require('./rotas')

const TODAY = new Date().toISOString().slice(0, 10)
const OUT   = path.join(ROOT, 'sitemap.xml')

const esc = s => s.replace(/&/g, '&amp;')

const urls = listarRotas(carregarMaterias()).map(r => ({
  loc: r.caminho ? `${BASE}/${r.caminho}` : `${BASE}/`,
  priority: r.prioridade,
  changefreq: r.changefreq,
  lastmod: TODAY,
}))

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
