#!/usr/bin/env node
// Garante que todo <img src="arquivo"> em conteudo/**/*.html tenha
// loading="lazy", decoding="async", width e height (dimensões reais do PNG/JPEG).
// Idempotente: atributos já presentes não são duplicados.
// Pula imagens com src vazio ou que não resolvam para um arquivo no disco.
// Uso: npm run normalizar-imagens

const sizeOf = require('image-size');
const fs = require('fs');
const path = require('path');

function findHtmlFiles(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findHtmlFiles(full, results);
    else if (entry.isFile() && entry.name.endsWith('.html')) results.push(full);
  }
  return results;
}

function getDimensions(htmlDir, src) {
  if (!src || src.startsWith('data:') || src.startsWith('http')) return null;
  const imgPath = path.resolve(htmlDir, src);
  if (!fs.existsSync(imgPath)) return null;
  try {
    const { width, height } = sizeOf(imgPath);
    return { width, height };
  } catch {
    return null;
  }
}

function addAttr(tag, name, value) {
  // Insere o atributo logo após "<img "
  return tag.replace(/^<img\s/, `<img ${name}="${value}" `);
}

function normalizeTag(tag, dims) {
  let t = tag;

  if (!/\bloading=/.test(t))  t = addAttr(t, 'loading',  'lazy');
  if (!/\bdecoding=/.test(t)) t = addAttr(t, 'decoding', 'async');
  if (dims) {
    if (!/\bwidth=/.test(t))  t = addAttr(t, 'width',  String(dims.width));
    if (!/\bheight=/.test(t)) t = addAttr(t, 'height', String(dims.height));
  }
  return t;
}

function processHtml(htmlPath) {
  const htmlDir = path.dirname(htmlPath);
  let content = fs.readFileSync(htmlPath, 'utf8');

  // Captura <img ...> incluindo quebras de linha dentro do tag
  const imgRe = /<img\s[^>]*>/g;
  const changes = [];
  let m;

  while ((m = imgRe.exec(content)) !== null) {
    const original = m[0];
    const src = (original.match(/\bsrc="([^"]*)"/) || [])[1] || '';

    // Pula lightboxes e placeholders com src vazio ou externo
    if (!src || src.startsWith('data:') || src.startsWith('http')) continue;

    const dims = getDimensions(htmlDir, src);
    const updated = normalizeTag(original, dims);

    if (updated !== original) {
      changes.push({ index: m.index, original, updated, src });
    }
  }

  if (changes.length === 0) return [];

  // Aplica de trás para frente para preservar índices
  changes.sort((a, b) => b.index - a.index);
  for (const c of changes) {
    content = content.slice(0, c.index) + c.updated + content.slice(c.index + c.original.length);
  }
  fs.writeFileSync(htmlPath, content, 'utf8');
  return changes.sort((a, b) => a.index - b.index);
}

async function main() {
  const root = process.cwd();
  const conteudo = path.join(root, 'conteudo');

  if (!fs.existsSync(conteudo)) {
    console.error('Erro: diretório conteudo/ não encontrado. Execute na raiz do repositório.');
    process.exit(1);
  }

  const htmlFiles = findHtmlFiles(conteudo);
  let totalFiles = 0, totalImgs = 0;

  for (const htmlPath of htmlFiles) {
    const changes = processHtml(htmlPath);
    if (changes.length === 0) continue;

    const rel = path.relative(root, htmlPath);
    console.log(`\n${rel}:`);
    for (const c of changes) {
      const added = [];
      if (!/\bloading=/.test(c.original))  added.push('loading');
      if (!/\bdecoding=/.test(c.original)) added.push('decoding');
      if (!/\bwidth=/.test(c.original))    added.push('width');
      if (!/\bheight=/.test(c.original))   added.push('height');
      console.log(`  ✓ ${c.src}  [adicionados: ${added.join(', ')}]`);
    }
    totalFiles++;
    totalImgs += changes.length;
  }

  if (totalImgs === 0) {
    console.log('\n✅ Nenhuma alteração — todas as imagens já estão normalizadas.');
  } else {
    console.log(`\n✅ ${totalImgs} imagem(ns) em ${totalFiles} arquivo(s) normalizada(s).\n`);
  }
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
