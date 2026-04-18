# Busca de Temas — Design Spec

**Data:** 2026-04-18  
**Site:** SPA vanilla JS, GitHub Pages — `https://prof-artur-vieira.github.io/estudos-direito/`

---

## Decisões de design

| Questão | Decisão |
|---|---|
| Posição do campo | Ícone 🔍 no header; clique expande campo inline |
| Escopo da busca | Catálogo (`data.js`) + texto completo dos HTMLs de tema |
| Exibição dos resultados | Painel fixo abaixo do header (não sobrepõe conteúdo) |
| Disparo | As-you-type a partir do 2º caractere, debounce 200 ms |
| Indexação | Lazy: fetch dos HTMLs na primeira abertura da lupa (~400 ms) |

---

## Arquitetura

### Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `index.html` | Botão 🔍 no header; `<div id="busca-painel">` após o header |
| `app.js` | Módulo de busca (novas funções; código existente intocado) |
| `style.css` | Estilos: campo expandido, painel, cards de resultado, highlight |

### Módulo de busca em `app.js`

```
abrirBusca()
  └─ 1ª vez → indexarConteudo() → fetch paralelo de todos os tema.arquivo
                                  → stripHTML() → window._searchIndex[]
  └─ expande campo no header, foca input

fecharBusca()
  └─ recolhe campo, oculta painel, limpa input

buscar(termo)           ← chamada com debounce 200 ms
  └─ normaliza (minúsculas, NFD sem diacríticos)
  └─ AND de palavras
  └─ score: match no título > match no corpo
  └─ extrai snippet (±60 chars ao redor do primeiro match)
  └─ retorna até 6 resultados

renderResultados(resultados, termo)
  └─ abre painel abaixo do header
  └─ cada resultado: label matéria · título · snippet com <mark>
  └─ clique → fecharBusca() + navega via roteamento SPA existente

indexarConteudo()
  └─ Promise.all(fetch de cada tema.arquivo)
  └─ DOMParser().parseFromString() → textContent (strip automático)
  └─ salva em window._searchIndex[]
```

### Estrutura do índice em memória

```js
window._searchIndex = [
  {
    titulo:    "Prisões e Cautelares",
    materia:   "Direito Processual Penal",
    materiaId: "processual-penal",
    turmaId:   "processual-penal-ii",
    temaIdx:   2,          // índice no array temas da turma (para navegação SPA)
    arquivo:   "conteudo/processual-penal-ii/03-prisoes.html",
    texto:     "…texto puro extraído via DOMParser…"
  },
  // …um objeto por tema
]
```

### Lógica de pontuação

- Match no `titulo`: +10 por palavra encontrada
- Match no `texto`: +1 por ocorrência (cap. 5)
- Resultados ordenados por score descendente; máximo 6 exibidos

---

## Estados da UI

### 1 — Repouso
Header normal com botão `🔍` à direita (32 × 32 px, estilo `rgba(255,255,255,.15)`).

### 2 — Indexando (só na primeira abertura)
Campo expandido desabilitado com placeholder `⏳ Indexando conteúdo…`. Conteúdo ao fundo levemente desfocado. Duração esperada: 300–600 ms.

### 3 — Busca ativa com resultados
- Campo habilitado com botão `✕` para fechar
- Painel abaixo do header (`background: #eef2f8`, borda inferior `2px solid #1F497D`)
- Cabeçalho do painel: `N resultados para "termo"`
- Cards de resultado: label matéria (uppercase, azul) · título (bold) · snippet com `<mark>` (fundo `#fff3cd`)
- Seta `›` à direita de cada card
- Conteúdo ao fundo com `opacity: 0.45`

### 4 — Sem resultados
Painel com mensagem: `Nenhum resultado para "termo"`.

---

## Comportamento de navegação

Clicar num resultado:
1. Chama `fecharBusca()` (recolhe campo e painel)
2. Chama `selecionarMateria(materiaId)` — navega para a matéria
3. Chama `selecionarTurma(materiaId, turmaId)` — navega para a turma
4. Chama `abrirTema(temaIdx)` — abre o tema; todas funções SPA existentes

---

## Acessibilidade

| Elemento | Atributo |
|---|---|
| Campo de busca | `role="search"`, `aria-label="Buscar tema"` |
| Painel de resultados | `aria-live="polite"` (anuncia contagem) |
| Cada resultado | `role="button"`, `tabindex="0"`, `onkeydown` Enter/Espaço |
| Fechar com teclado | `Esc` chama `fecharBusca()` |

---

## O que fica fora do escopo

- Busca fonética / fuzzy (ex.: "flagrnte" → não encontra)
- Histórico de buscas
- Filtro por matéria
- Indexação de `sobre.html`
- Pré-geração de índice JSON (reservado para quando o site crescer além de ~50 temas)
