#!/usr/bin/env node
// Gera os ícones de PWA a partir de icons/icon.svg.
// Saída em icons/: icon-192.png, icon-512.png,
//   icon-maskable-512.png, apple-touch-icon-180.png
// Uso: npm run gerar-icones

const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const THEME = '#1F497D';
const ICONS  = path.join(process.cwd(), 'icons');
const SRC    = path.join(ICONS, 'icon.svg');

function hexBg(hex) {
  return {
    r: parseInt(hex.slice(1, 3), 16),
    g: parseInt(hex.slice(3, 5), 16),
    b: parseInt(hex.slice(5, 7), 16),
  };
}

// Renderiza o SVG com fundo sólido THEME + conteúdo centralizado.
// paddingRatio: fração de cada lado reservada como margem (0 = sem margem).
async function withSolidBg(size, paddingRatio) {
  const contentSize = Math.round(size * (1 - 2 * paddingRatio));
  const offset      = Math.round(size * paddingRatio);
  const bg          = hexBg(THEME);

  // Renderiza o SVG (que já tem fundo azul arredondado) no tamanho do conteúdo
  const svgPng = await sharp(SRC)
    .resize(contentSize, contentSize)
    .png()
    .toBuffer();

  // Compõe sobre um quadrado sólido (sem cantos transparentes)
  return sharp({
    create: { width: size, height: size, channels: 3, background: bg }
  })
    .composite([{ input: svgPng, left: offset, top: offset }])
    .png();
}

async function generate(outFile, size, opts = {}) {
  const dest = path.join(ICONS, outFile);
  const { maskable = false, appleTouchIcon = false } = opts;

  if (maskable) {
    // Zona segura do Android: 20 % de cada lado → conteúdo ocupa 60 % central
    await (await withSolidBg(size, 0.20)).toFile(dest);
  } else if (appleTouchIcon) {
    // iOS recorta com rounded-rect próprio; fundo sólido evita halo branco
    await (await withSolidBg(size, 0.10)).toFile(dest);
  } else {
    // Ícone any-purpose: renderiza o SVG diretamente (cantos transparentes OK)
    await sharp(SRC).resize(size, size).png().toFile(dest);
  }

  const kb = Math.round(fs.statSync(dest).size / 1024);
  console.log(`  ✓ ${outFile.padEnd(30)} ${size}×${size}px  ${kb} KB`);
}

async function main() {
  if (!fs.existsSync(SRC)) {
    console.error('Erro: icons/icon.svg não encontrado. Execute na raiz do repositório.');
    process.exit(1);
  }
  console.log('\nGerando ícones de PWA…\n');

  await generate('icon-192.png',           192);
  await generate('icon-512.png',           512);
  await generate('icon-maskable-512.png',  512, { maskable: true });
  await generate('apple-touch-icon-180.png', 180, { appleTouchIcon: true });

  console.log('\n✅ Ícones prontos em icons/\n');
}

main().catch(err => { console.error('\n❌', err.message); process.exit(1); });
