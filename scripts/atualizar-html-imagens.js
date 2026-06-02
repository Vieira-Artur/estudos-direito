#!/usr/bin/env node
// Atualiza todos os <img src="*.png"> em conteudo/**/*.html para <picture>.
// Adiciona AVIF e WebP como sources, preserva alt/atributos, garante
// loading="lazy", decoding="async" e width/height reais lidos do PNG.
// Idempotente: pula <img> já dentro de <picture>.
// Uso: npm run atualizar-html

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// ── Utilitários ───────────────────────────────────────────────────────────

function findFiles(dir, ext, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) findFiles(full, ext, results);
    else if (entry.isFile() && entry.name.endsWith(ext)) results.push(full);
  }
  return results;
}

async function readDimensions(pngPath) {
  if (!fs.existsSync(pngPath)) return { width: null, height: null };
  const { width, height } = await sharp(pngPath).metadata();
  return { width, height };
}

function isInsidePicture(content, idx) {
  const before = content.slice(0, idx);
  const lastOpen  = before.lastIndexOf('<picture');
  const lastClose = before.lastIndexOf('</picture>');
  return lastOpen !== -1 && lastOpen > lastClose;
}

// ── Construção do bloco <picture> ─────────────────────────────────────────

function buildPicture(src, imgTag, width, height) {
  const avifSrc = src.replace(/\.png$/, '.avif');
  const webpSrc = src.replace(/\.png$/, '.webp');

  let img = imgTag;

  // Garante loading="lazy"
  if (!/\bloading=/.test(img)) {
    img = img.replace('<img', '<img loading="lazy"');
  }
  // Garante decoding="async"
  if (!/\bdecoding=/.test(img)) {
    img = img.replace('<img', '<img decoding="async"');
  }
  // Garante width se ausente
  if (width && !/\bwidth=/.test(img)) {
    img = img.replace('<img', `<img width="${width}"`);
  }
  // Garante height se ausente
  if (height && !/\bheight=/.test(img)) {
    img = img.replace('<img', `<img height="${height}"`);
  }

  return (
    `<picture>\n` +
    `  <source type="image/avif" srcset="${avifSrc}">\n` +
    `  <source type="image/webp" srcset="${webpSrc}">\n` +
    `  ${img}\n` +
    `</picture>`
  );
}

// ── Processamento de um arquivo HTML ─────────────────────────────────────

async function processHtml(htmlPath) {
  const htmlDir = path.dirname(htmlPath);
  let content = fs.readFileSync(htmlPath, 'utf8');

  // Captura <img ...src="*.png"...> inclusive com quebras de linha no tag
  const imgRe = /<img\s[^>]*src="([^"]+\.png)"[^>]*>/g;

  const matches = [];
  let m;
  while ((m = imgRe.exec(content)) !== null) {
    const src = m[1];
    // Pula se já está dentro de <picture>
    if (isInsidePicture(content, m.index)) continue;
    // Pula se o AVIF correspondente não foi gerado (imagem não está no conteudo/)
    const avifPath = path.join(htmlDir, src.replace(/\.png$/, '.avif'));
    if (!fs.existsSync(avifPath)) continue;

    const pngPath = path.join(htmlDir, src);
    const { width, height } = await readDimensions(pngPath);
    matches.push({ index: m.index, length: m[0].length, tag: m[0], src, width, height });
  }

  if (matches.length === 0) return [];

  // Aplica substituições de trás para frente (preserva índices)
  matches.sort((a, b) => b.index - a.index);
  for (const r of matches) {
    const picture = buildPicture(r.src, r.tag, r.width, r.height);
    content = content.slice(0, r.index) + picture + content.slice(r.index + r.length);
  }

  fs.writeFileSync(htmlPath, content, 'utf8');
  return matches.sort((a, b) => a.index - b.index); // retorna em ordem original
}

// ── Main ──────────────────────────────────────────────────────────────────

async function main() {
  const root = process.cwd();
  const conteudo = path.join(root, 'conteudo');

  if (!fs.existsSync(conteudo)) {
    console.error('Erro: diretório conteudo/ não encontrado. Execute na raiz do repositório.');
    process.exit(1);
  }

  const htmlFiles = findFiles(conteudo, '.html');
  let totalFiles = 0, totalImgs = 0;

  for (const htmlPath of htmlFiles) {
    const changes = await processHtml(htmlPath);
    if (changes.length === 0) continue;
    const rel = path.relative(root, htmlPath);
    console.log(`\n${rel}:`);
    for (const c of changes) {
      console.log(`  ✓ ${c.src}  →  <picture> [${c.width}×${c.height}]`);
    }
    totalFiles++;
    totalImgs += changes.length;
  }

  if (totalImgs === 0) {
    console.log('\nNenhuma alteração — HTMLs já estão atualizados.');
  } else {
    console.log(`\n✅ ${totalImgs} imagem(ns) em ${totalFiles} arquivo(s) atualizados.\n`);
  }
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
