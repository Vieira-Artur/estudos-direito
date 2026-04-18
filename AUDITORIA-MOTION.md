# Auditoria de Motion — prefers-reduced-motion

Mapeamento de todas as animações e transições do site tratadas para respeitar `prefers-reduced-motion`.  
**O killswitch global (`* { animation: none !important }`) NÃO foi utilizado.**

## Animações de entrada (@keyframes fadeUp)

| Seletor | Comportamento padrão | Comportamento reduzido |
|---|---|---|
| `.arvore` | `fadeUp` (opacity + translateY) | `fadeUp` só opacity |
| `.hero` | `fadeUp` (opacity + translateY) | `fadeUp` só opacity |
| `.cards-turmas` | `fadeUp` (opacity + translateY) | `fadeUp` só opacity |
| `.cards-temas` | `fadeUp` (opacity + translateY) | `fadeUp` só opacity |
| `.materias-cards` | `fadeUp` (opacity + translateY) | `fadeUp` só opacity |
| `#conteudo-area` | `fadeUp` (opacity + translateY) | `fadeUp` só opacity |
| `.flash-sessao` | `fadeUp` (opacity + translateY) | `fadeUp` só opacity |
| `.flash-resumo` | `fadeUp` (opacity + translateY) | `fadeUp` só opacity |

## Skeleton shimmer (@keyframes sk-shimmer)

| Seletor | Comportamento padrão | Comportamento reduzido |
|---|---|---|
| `.sk`, `.sk-inv` | shimmer horizontal infinito | `animation-play-state: paused` |

## Transições com transform

| Seletor | Transform padrão | Reduzido |
|---|---|---|
| `.card-materia:hover` | `translateY(-2px)` | `transform: none` |
| `.card-materia:active` | `translateY(0)` | `transform: none` |
| `.card-turma:hover` | `translateY(-2px)` | `transform: none` |
| `.card-tema:hover` | `translateY(-3px)` | `transform: none` |
| `.no-tema:hover` | `translateX(3px)` | `transform: none` |
| `.no-tema::before` | `left .18s` | `transition: opacity .18s` |
| `.flash-card:active` | `scale(.98)` | `transform: none` |
| `#btn-topo` | `translateY(12px→0)` | `transform: none` (só opacity) |
| `.skip-link` | `transition: top .15s` | `transition: none` |

## Scroll programático (app.js, index.html, 404.html)

| Local | Antes | Depois |
|---|---|---|
| `abrirTema` âncoras internas | `behavior: 'smooth'` fixo | `matchMedia` → `'auto'` ou `'smooth'` |
| `rolarParaAncora()` | já usava `matchMedia` ✓ | sem alteração |
| `#btn-topo` (index.html) | `behavior: 'smooth'` fixo | `matchMedia` → `'auto'` ou `'smooth'` |
| `#btn-topo` (404.html) | `behavior: 'smooth'` fixo | `matchMedia` → `'auto'` ou `'smooth'` |

## Transições mantidas intactas (só visuais, sem movimento)

`.btn-sobre`, `#breadcrumb .crumb`, `.turma-tab`, `.card-tema::after`, `.flash-btn`, `.flash-resumo-btn`, `.flash-btn-deletar`, `#busca-btn`, `.busca-resultado`, `.flash-barra-fill`

## Como testar

1. DevTools → Rendering → Emulate CSS `prefers-reduced-motion: reduce`
2. Hover nos cards: sombra muda, elemento NÃO sobe
3. Clicar num tema: conteúdo aparece em fade, sem deslocamento vertical
4. Scroll para âncora: instantâneo
5. Botão ↑ (topo): scroll instantâneo
6. Alternar para `no-preference` → todas as animações originais voltam
