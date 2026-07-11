#!/usr/bin/env node
/**
 * Gera páginas-casca estáticas para cada rota do SPA.
 *
 * Motivo: no GitHub Pages, rotas como /penal/penal-iv respondem 404 (o truque
 * do 404.html funciona para usuários, mas o Google não indexa URLs 404 e
 * crawlers sociais não executam JS — sem preview no WhatsApp). Cada casca é
 * uma cópia do index.html com <title>, description, OG e canonical próprios,
 * e caminhos de assets absolutos. O app assume a navegação ao carregar.
 *
 * Uso: node scripts/gerar-rotas-estaticas.js   (rode após alterar data.js)
 */

'use strict'

const fs   = require('fs')
const path = require('path')
const { ROOT, BASE, carregarMaterias, listarRotas } = require('./rotas')

const BASE_PATH = new URL(BASE).pathname + '/'   // "/estudos-direito/"

const escHtml = s => String(s)
  .replace(/&/g, '&amp;').replace(/</g, '&lt;')
  .replace(/>/g, '&gt;').replace(/"/g, '&quot;')

const shell = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8')

function gerarCasca(rota) {
  const url = rota.caminho ? `${BASE}/${rota.caminho}` : `${BASE}/`
  let html = shell

  // Metadados próprios da rota
  html = html.replace(/<title>[^<]*<\/title>/, `<title>${escHtml(rota.titulo)}</title>`)
  html = html.replace(/(<meta name="description" content=")[^"]*(")/, `$1${escHtml(rota.descricao)}$2`)
  html = html.replace(/(<meta property="og:title" content=")[^"]*(")/, `$1${escHtml(rota.titulo)}$2`)
  html = html.replace(/(<meta property="og:description" content=")[^"]*(")/, `$1${escHtml(rota.descricao)}$2`)
  html = html.replace(/(<meta property="og:url" content=")[^"]*(")/, `$1${url}$2`)
  html = html.replace(/(<meta name="twitter:title" content=")[^"]*(")/, `$1${escHtml(rota.titulo)}$2`)
  html = html.replace(/(<meta name="twitter:description" content=")[^"]*(")/, `$1${escHtml(rota.descricao)}$2`)
  html = html.replace(/(<link rel="canonical" href=")[^"]*(")/, `$1${url}$2`)

  // Assets com caminho absoluto (a casca vive num subdiretório)
  for (const [attr, arquivo] of [
    ['href', 'style.css'], ['href', 'meu-espaco.css'], ['href', 'manifest.json'],
    ['href', 'icons/apple-touch-icon-180.png'],
    ['src', 'data.js'], ['src', 'meu-espaco.js'], ['src', 'app.js'],
  ]) {
    html = html.replace(`${attr}="${arquivo}"`, `${attr}="${BASE_PATH}${arquivo}"`)
  }
  html = html.replace('href="./sobre"', `href="${BASE_PATH}sobre"`)

  return html
}

const rotas = listarRotas(carregarMaterias()).filter(r => r.caminho !== '')
let geradas = 0
for (const rota of rotas) {
  const dir = path.join(ROOT, ...rota.caminho.split('/'))
  fs.mkdirSync(dir, { recursive: true })
  fs.writeFileSync(path.join(dir, 'index.html'), gerarCasca(rota), 'utf8')
  geradas++
}
console.log(`${geradas} páginas-casca geradas.`)
