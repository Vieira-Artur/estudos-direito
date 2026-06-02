#!/usr/bin/env node
// Gera versões AVIF e WebP de todos os PNGs em conteudo/.
// Idempotente: pula se o derivado já existir e for mais novo que o PNG.
// Uso: npm run otimizar-imagens

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const AVIF_OPTS = { quality: 58, effort: 6 };
const WEBP_OPTS = { quality: 82 };

function findPngs(dir, results = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      findPngs(full, results);
    } else if (entry.isFile() && entry.name.endsWith('.png')) {
      results.push(full);
    }
  }
  return results;
}

function pad(str, n) { return String(str).padStart(n); }
function trunc(str, n) { return str.length > n ? str.slice(0, n - 1) + '…' : str.padEnd(n); }

async function main() {
  const root = process.cwd();
  const conteudo = path.join(root, 'conteudo');

  if (!fs.existsSync(conteudo)) {
    console.error('Erro: diretório conteudo/ não encontrado. Execute na raiz do repositório.');
    process.exit(1);
  }

  const pngs = findPngs(conteudo);
  console.log(`\nEncontrados ${pngs.length} arquivo(s) PNG em conteudo/\n`);

  const rows = [];
  let totalPngB = 0, totalAvifB = 0, totalWebpB = 0;

  for (const absPath of pngs) {
    const dir = path.dirname(absPath);
    const base = path.basename(absPath, '.png');
    const avifPath = path.join(dir, base + '.avif');
    const webpPath = path.join(dir, base + '.webp');
    const rel = path.relative(root, absPath);

    const pngStat = fs.statSync(absPath);
    const pngKB = Math.round(pngStat.size / 1024);

    const needAvif = !fs.existsSync(avifPath) || fs.statSync(avifPath).mtimeMs <= pngStat.mtimeMs;
    const needWebp = !fs.existsSync(webpPath) || fs.statSync(webpPath).mtimeMs <= pngStat.mtimeMs;

    const meta = await sharp(absPath).metadata();

    if (needAvif) {
      await sharp(absPath).avif(AVIF_OPTS).toFile(avifPath);
    }
    if (needWebp) {
      await sharp(absPath).webp(WEBP_OPTS).toFile(webpPath);
    }

    const avifKB = Math.round(fs.statSync(avifPath).size / 1024);
    const webpKB = Math.round(fs.statSync(webpPath).size / 1024);

    totalPngB  += pngStat.size;
    totalAvifB += fs.statSync(avifPath).size;
    totalWebpB += fs.statSync(webpPath).size;

    const status = (!needAvif && !needWebp) ? ' (cache)' : '';
    console.log(`  ✓ ${path.basename(rel).padEnd(45)} PNG:${pad(pngKB+'KB',7)}  AVIF:${pad(avifKB+'KB',6)}  WebP:${pad(webpKB+'KB',6)}${status}`);
    rows.push({ rel, pngKB, avifKB, webpKB, width: meta.width, height: meta.height });
  }

  // ── Tabela resumo ──────────────────────────────────────────────────────
  const COL = 46;
  const line = '─'.repeat(COL + 27);
  console.log(`\n┌${'─'.repeat(COL)}┬───────┬──────┬──────┐`);
  console.log(`│ ${'Arquivo'.padEnd(COL - 2)} │  PNG  │ AVIF │ WebP │`);
  console.log(`├${'─'.repeat(COL)}┼───────┼──────┼──────┤`);
  for (const r of rows) {
    const name = trunc(path.basename(r.rel), COL - 2);
    console.log(`│ ${name} │ ${pad(r.pngKB+'KB', 5)} │ ${pad(r.avifKB+'KB', 4)} │ ${pad(r.webpKB+'KB', 4)} │`);
  }
  console.log(`├${'─'.repeat(COL)}┼───────┼──────┼──────┤`);
  const tp = Math.round(totalPngB  / 1024);
  const ta = Math.round(totalAvifB / 1024);
  const tw = Math.round(totalWebpB / 1024);
  console.log(`│ ${'TOTAL'.padEnd(COL - 2)} │ ${pad(tp+'KB', 5)} │ ${pad(ta+'KB', 4)} │ ${pad(tw+'KB', 4)} │`);
  console.log(`└${'─'.repeat(COL)}┴───────┴──────┴──────┘`);

  const savAvif = ((1 - totalAvifB / totalPngB) * 100).toFixed(1);
  const savWebp = ((1 - totalWebpB / totalPngB) * 100).toFixed(1);
  const mbAvif  = ((totalPngB - totalAvifB) / 1048576).toFixed(1);
  const mbWebp  = ((totalPngB - totalWebpB) / 1048576).toFixed(1);
  console.log(`\nEconomia AVIF vs PNG: ${savAvif}% (−${mbAvif} MB)`);
  console.log(`Economia WebP vs PNG: ${savWebp}% (−${mbWebp} MB)`);
  console.log(`\nPróximo passo: npm run atualizar-html\n`);
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
