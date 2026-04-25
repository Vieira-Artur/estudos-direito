# Hiperlinks Automáticos de Julgados — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Detectar automaticamente citações do STF/STJ nos arquivos de conteúdo carregados via fetch e envolvê-las em `<a class="julgado-link">` com link para o tribunal correspondente.

**Architecture:** Pós-processamento dinâmico em `app.js`. Após cada `fetch` de conteúdo, a função `linkificarJulgados(el)` percorre nós de texto via TreeWalker, detecta citações com regex, e substitui cada nó de texto por um DocumentFragment com texto + `<a>` intercalados. Nenhum HTML de conteúdo é tocado.

**Tech Stack:** HTML/JS puro (sem build tool ou framework), CSS, APIs nativas do DOM (TreeWalker, DocumentFragment, createTextNode).

---

## Arquivos alterados

| Arquivo | Operação | O que muda |
|---|---|---|
| `style.css` | Modificar | Nova seção `/* ── Julgados */` no final (após linha 1579) |
| `app.js` | Modificar | Nova seção `// ── Julgados ──` após linha 999 + 2 chamadas a `linkificarJulgados()` |
| `test-julgados.html` | Criar | Página de teste isolada (deletar após verificação) |
| `preview-julgados.html` | Deletar | Arquivo de preview do brainstorming |

---

## Task 1: CSS — estilos de `.julgado-link`

**Files:**
- Modify: `style.css` (final do arquivo, após linha 1579)

- [ ] **Step 1: Adicionar as regras CSS no final de `style.css`**

Adicionar EXATAMENTE após a última linha do arquivo (`}`):

```css

/* ── Julgados ───────────────────────────────────────────── */
.julgado-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: #1F497D;
  text-underline-offset: 3px;
  transition: color .15s, text-decoration-style .15s;
  white-space: nowrap;
}
.julgado-link::after {
  content: ' ⚖';
  font-size: 0.7em;
  opacity: 0.2;
  transition: opacity .15s;
  vertical-align: middle;
}
.julgado-link:hover {
  color: #1F497D;
  text-decoration-style: solid;
}
.julgado-link:hover::after { opacity: 1; }
@media (hover: none) {
  .julgado-link::after { opacity: 0.7; }
}
```

- [ ] **Step 2: Commit**

```bash
git add style.css
git commit -m "style: add .julgado-link styles for tribunal citation links"
```

---

## Task 2: Página de teste isolada

**Files:**
- Create: `test-julgados.html`

Esta página define `linkificarJulgados` inline (cópia temporária) e roda asserções. Serve para verificar os regex antes de integrar. Deletada na Task 5.

- [ ] **Step 1: Criar `test-julgados.html`**

```html
<!DOCTYPE html>
<html lang="pt-BR">
<head>
<meta charset="UTF-8">
<title>Teste — linkificarJulgados</title>
<style>
  body { font-family: monospace; padding: 1rem; }
  .pass { color: green; }
  .fail { color: red; font-weight: bold; }
</style>
</head>
<body>
<h2>Resultados dos testes</h2>
<div id="out"></div>
<script>
// ── Cópia provisória da implementação para teste isolado ──────────────
function _detectarTribunal(text, matchIdx, fallback) {
  const chunk = text.slice(Math.max(0, matchIdx - 60), Math.min(text.length, matchIdx + 80)).toUpperCase()
  if (/\bSTF\b/.test(chunk)) return 'stf'
  if (/\bSTJ\b/.test(chunk)) return 'stj'
  return fallback
}

function _urlJulgado({ tribunal, tipo, m }) {
  const g = m.groups
  const num = (g.num || '').replace(/\./g, '')
  if (tipo === 'sumula') return `https://scon.stj.jus.br/SCON/pesquisar.jsp?query=S%C3%BAmula+${num}`
  if (tipo === 'sv')     return `https://jurisprudencia.stf.jus.br/pages/search?queryString=S%C3%BAmula+Vinculante+${num}`
  if (tipo === 'tema') {
    if ((g.court || '').toUpperCase() === 'STJ')
      return `https://processo.stj.jus.br/repetitivos/temas_repetitivos/pesquisa.jsp?tipo=tabela&cod=${num}`
    return `https://jurisprudencia.stf.jus.br/pages/search?queryString=Tema+${num}`
  }
  const t = encodeURIComponent(g.tipo || '')
  if (tribunal === 'stj') return `https://scon.stj.jus.br/SCON/pesquisar.jsp?query=${t}+${num}`
  return `https://jurisprudencia.stf.jus.br/pages/search?queryString=${t}+${num}`
}

function linkificarJulgados(el) {
  if (!el) return
  const PX = '(?:(?:AgRg|AgInt|EDcl|EDiv|QO)\\s+n[ao]s?\\s+)?'
  const NM = '(?<num>\\d[\\d.]*\\d|\\d)(?:\\s*[-/]\\s*[A-Z]{2})?'
  const PADROES = [
    { re: new RegExp(`\\b${PX}(?<tipo>REsp|AREsp|RHC|EREsp)\\s+${NM}`, 'g'), tribunal: 'stj' },
    { re: new RegExp(`\\b${PX}(?<tipo>ADI|ADC|ADPF|ARE|MI|RCL)\\s+${NM}`, 'g'), tribunal: 'stf' },
    { re: new RegExp(`\\b${PX}(?<tipo>HC)\\s+${NM}`, 'g'),  tribunal: null, fallback: 'stj' },
    { re: new RegExp(`\\b${PX}(?<tipo>RE)\\s+${NM}`, 'g'),  tribunal: null, fallback: 'stf' },
    { re: new RegExp(`\\b${PX}(?<tipo>MS)\\s+${NM}`, 'g'),  tribunal: null, fallback: 'stf' },
    { re: /S[uú]m(?:ula)?\.?\s+n?[ºo°.]?\s*(?<num>\d+)\s+(?:do\s+)?STJ/g, tribunal: 'stj', tipo: 'sumula' },
    { re: /\bSV\s+(?<num>\d+)\b/g,                                           tribunal: 'stf', tipo: 'sv' },
    { re: /S[uú]mula\s+Vinculante\s+n?[ºo°.]?\s*(?<num>\d+)/g,              tribunal: 'stf', tipo: 'sv' },
    { re: /Tema\s+(?<num>\d+)\s+(?:do\s+)?(?<court>STJ|STF)/g, tribunal: null, tipo: 'tema' },
  ]
  const SKIP = new Set(['A', 'CODE', 'SCRIPT', 'STYLE', 'PRE'])
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p = node.parentElement
      while (p && p !== el) {
        if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT
        p = p.parentElement
      }
      return NodeFilter.FILTER_ACCEPT
    }
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    const text = node.nodeValue
    const hits = []
    for (const { re, tribunal, fallback, tipo } of PADROES) {
      re.lastIndex = 0
      let m
      while ((m = re.exec(text)) !== null) {
        const s = m.index, e = m.index + m[0].length
        if (hits.some(h => h.s < e && h.e > s)) continue
        const trib = tribunal ?? _detectarTribunal(text, s, fallback ?? 'stj')
        hits.push({ s, e, raw: m[0], tribunal: trib, tipo: tipo ?? 'acordao', m })
      }
    }
    if (!hits.length) continue
    hits.sort((a, b) => a.s - b.s)
    const frag = document.createDocumentFragment()
    let cur = 0
    for (const h of hits) {
      if (h.s > cur) frag.appendChild(document.createTextNode(text.slice(cur, h.s)))
      const a = document.createElement('a')
      a.className   = 'julgado-link'
      a.textContent = h.raw
      a.href        = _urlJulgado(h)
      a.target      = '_blank'
      a.rel         = 'noopener noreferrer'
      a.title       = `Ver no ${h.tribunal.toUpperCase()}`
      frag.appendChild(a)
      cur = h.e
    }
    if (cur < text.length) frag.appendChild(document.createTextNode(text.slice(cur)))
    node.parentNode.replaceChild(frag, node)
  }
}
// ─────────────────────────────────────────────────────────

// ── Mini framework de testes ──────────────────────────────
const out = document.getElementById('out')
let passed = 0, failed = 0

function criarEl(html) {
  const div = document.createElement('div')
  div.innerHTML = html
  return div
}

function assert(label, condition) {
  const el = document.createElement('div')
  if (condition) {
    el.className = 'pass'
    el.textContent = '✓ ' + label
    passed++
  } else {
    el.className = 'fail'
    el.textContent = '✗ ' + label
    failed++
  }
  out.appendChild(el)
}

// ── Testes ────────────────────────────────────────────────

// T1: REsp → STJ
;(function() {
  const el = criarEl('<p>Conforme REsp 1.977.135, o tribunal decidiu.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T1: REsp gera link', links.length === 1)
  assert('T1: REsp texto correto', links[0]?.textContent === 'REsp 1.977.135')
  assert('T1: REsp aponta STJ', links[0]?.href.includes('scon.stj.jus.br'))
  assert('T1: REsp número sem pontos na URL', links[0]?.href.includes('1977135'))
})()

// T2: AREsp → STJ
;(function() {
  const el = criarEl('<p>Ver AREsp 2.123.334-MG.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T2: AREsp gera link STJ', links.length === 1 && links[0]?.href.includes('scon.stj.jus.br'))
})()

// T3: ADI → STF
;(function() {
  const el = criarEl('<p>A ADI 4296/DF tratou do tema.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T3: ADI gera link', links.length === 1)
  assert('T3: ADI aponta STF', links[0]?.href.includes('jurisprudencia.stf.jus.br'))
})()

// T4: HC com "STF" no contexto → STF
;(function() {
  const el = criarEl('<p>O STF julgou o HC 96.356/RS por maioria.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T4: HC com STF no contexto → link STF', links.length === 1 && links[0]?.href.includes('jurisprudencia.stf.jus.br'))
})()

// T5: HC sem contexto → STJ (default)
;(function() {
  const el = criarEl('<p>Conforme HC 740.431-DF, a prova foi admitida.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T5: HC sem contexto → STJ default', links.length === 1 && links[0]?.href.includes('scon.stj.jus.br'))
})()

// T6: Súmula STJ
;(function() {
  const el = criarEl('<p>Aplica-se a Súmula 17 STJ ao caso.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T6: Súmula STJ gera link', links.length === 1)
  assert('T6: Súmula STJ aponta SCON', links[0]?.href.includes('scon.stj.jus.br') && links[0]?.href.includes('S%C3%BAmula'))
  assert('T6: Súmula STJ número correto', links[0]?.href.includes('+17'))
})()

// T7: SV (Súmula Vinculante) — forma curta
;(function() {
  const el = criarEl('<p>Ver SV 36 sobre o tema.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T7: SV gera link STF', links.length === 1 && links[0]?.href.includes('jurisprudencia.stf.jus.br'))
  assert('T7: SV contém "Vinculante" na URL', links[0]?.href.includes('Vinculante'))
})()

// T8: Súmula Vinculante — forma longa
;(function() {
  const el = criarEl('<p>Súmula Vinculante 50 estabelece que...</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T8: Súmula Vinculante longa gera link STF', links.length === 1 && links[0]?.href.includes('jurisprudencia.stf.jus.br'))
})()

// T9: Tema STJ
;(function() {
  const el = criarEl('<p>Conforme Tema 1313 STJ, os honorários...</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T9: Tema STJ gera link', links.length === 1)
  assert('T9: Tema STJ aponta repetitivos', links[0]?.href.includes('repetitivos') && links[0]?.href.includes('1313'))
})()

// T10: AgRg no REsp — prefixo preservado
;(function() {
  const el = criarEl('<p>O AgRg no REsp 1.234.567/SP foi desprovido.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T10: AgRg no REsp gera 1 link', links.length === 1)
  assert('T10: AgRg no REsp texto completo', links[0]?.textContent.startsWith('AgRg'))
})()

// T11: Sem correspondência — nenhum link
;(function() {
  const el = criarEl('<p>Texto comum sem citação de julgado.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T11: Texto sem citação → sem links', links.length === 0)
})()

// T12: Texto dentro de <code> não é linkado
;(function() {
  const el = criarEl('<p>Ver <code>REsp 1.977.135</code> no código.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T12: <code> não é linkado', links.length === 0)
})()

// T13: Link já existente não é re-linkado
;(function() {
  const el = criarEl('<p>Ver <a href="http://stj.jus.br">HC 123.456</a>.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T13: <a> existente não é re-linkado', links.length === 0)
})()

// T14: REsp não captura RE como falso positivo
;(function() {
  const el = criarEl('<p>O REsp 1.977.135 e o RE 601.392 divergem.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T14: REsp e RE geram 2 links distintos', links.length === 2)
  assert('T14: REsp → STJ', [...links].some(a => a.textContent.startsWith('REsp') && a.href.includes('scon.stj')))
  assert('T14: RE → STF', [...links].some(a => a.textContent === 'RE 601.392' && a.href.includes('stf.jus.br')))
})()

// T15: Multiple citations in one paragraph
;(function() {
  const el = criarEl('<p>Conforme HC 740.431-DF e REsp 1.977.135, além da Súmula 17 STJ.</p>')
  linkificarJulgados(el)
  const links = el.querySelectorAll('.julgado-link')
  assert('T15: 3 citações em 1 parágrafo → 3 links', links.length === 3)
})()

// ── Resumo ────────────────────────────────────────────────
const resumo = document.createElement('div')
resumo.style.cssText = 'margin-top:1rem;font-weight:bold;font-size:1.1rem'
resumo.textContent = `${passed} passed, ${failed} failed`
resumo.style.color = failed === 0 ? 'green' : 'red'
out.appendChild(resumo)
</script>
</body>
</html>
```

- [ ] **Step 2: Abrir `test-julgados.html` no navegador**

Abrir o arquivo `test-julgados.html` diretamente no browser (duplo clique ou arrastar para Chrome/Edge).

Expected: Todos os testes marcados com ✓ verde. Se algum estiver vermelho, o regex precisa de ajuste antes de prosseguir para a Task 3.

---

## Task 3: Implementação de `linkificarJulgados` em `app.js`

**Files:**
- Modify: `app.js` (após linha 999 — fim da seção `// ── Busca ──`)

- [ ] **Step 1: Adicionar a seção `// ── Julgados ──` no final de `app.js`**

Inserir após a última linha de `fecharBusca` (linha 999, o `}` que fecha a função):

```javascript

// ── Julgados ──────────────────────────────────────────────

function _detectarTribunal(text, matchIdx, fallback) {
  const chunk = text.slice(Math.max(0, matchIdx - 60), Math.min(text.length, matchIdx + 80)).toUpperCase()
  if (/\bSTF\b/.test(chunk)) return 'stf'
  if (/\bSTJ\b/.test(chunk)) return 'stj'
  return fallback
}

function _urlJulgado({ tribunal, tipo, m }) {
  const g = m.groups
  const num = (g.num || '').replace(/\./g, '')
  if (tipo === 'sumula') return `https://scon.stj.jus.br/SCON/pesquisar.jsp?query=S%C3%BAmula+${num}`
  if (tipo === 'sv')     return `https://jurisprudencia.stf.jus.br/pages/search?queryString=S%C3%BAmula+Vinculante+${num}`
  if (tipo === 'tema') {
    if ((g.court || '').toUpperCase() === 'STJ')
      return `https://processo.stj.jus.br/repetitivos/temas_repetitivos/pesquisa.jsp?tipo=tabela&cod=${num}`
    return `https://jurisprudencia.stf.jus.br/pages/search?queryString=Tema+${num}`
  }
  const t = encodeURIComponent(g.tipo || '')
  if (tribunal === 'stj') return `https://scon.stj.jus.br/SCON/pesquisar.jsp?query=${t}+${num}`
  return `https://jurisprudencia.stf.jus.br/pages/search?queryString=${t}+${num}`
}

function linkificarJulgados(el) {
  if (!el) return
  const PX = '(?:(?:AgRg|AgInt|EDcl|EDiv|QO)\\s+n[ao]s?\\s+)?'
  const NM = '(?<num>\\d[\\d.]*\\d|\\d)(?:\\s*[-/]\\s*[A-Z]{2})?'
  const PADROES = [
    { re: new RegExp(`\\b${PX}(?<tipo>REsp|AREsp|RHC|EREsp)\\s+${NM}`, 'g'), tribunal: 'stj' },
    { re: new RegExp(`\\b${PX}(?<tipo>ADI|ADC|ADPF|ARE|MI|RCL)\\s+${NM}`, 'g'), tribunal: 'stf' },
    { re: new RegExp(`\\b${PX}(?<tipo>HC)\\s+${NM}`, 'g'),  tribunal: null, fallback: 'stj' },
    { re: new RegExp(`\\b${PX}(?<tipo>RE)\\s+${NM}`, 'g'),  tribunal: null, fallback: 'stf' },
    { re: new RegExp(`\\b${PX}(?<tipo>MS)\\s+${NM}`, 'g'),  tribunal: null, fallback: 'stf' },
    { re: /S[uú]m(?:ula)?\.?\s+n?[ºo°.]?\s*(?<num>\d+)\s+(?:do\s+)?STJ/g, tribunal: 'stj', tipo: 'sumula' },
    { re: /\bSV\s+(?<num>\d+)\b/g,                                           tribunal: 'stf', tipo: 'sv' },
    { re: /S[uú]mula\s+Vinculante\s+n?[ºo°.]?\s*(?<num>\d+)/g,              tribunal: 'stf', tipo: 'sv' },
    { re: /Tema\s+(?<num>\d+)\s+(?:do\s+)?(?<court>STJ|STF)/g, tribunal: null, tipo: 'tema' },
  ]
  const SKIP = new Set(['A', 'CODE', 'SCRIPT', 'STYLE', 'PRE'])
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      let p = node.parentElement
      while (p && p !== el) {
        if (SKIP.has(p.tagName)) return NodeFilter.FILTER_REJECT
        p = p.parentElement
      }
      return NodeFilter.FILTER_ACCEPT
    }
  })
  const nodes = []
  while (walker.nextNode()) nodes.push(walker.currentNode)
  for (const node of nodes) {
    const text = node.nodeValue
    const hits = []
    for (const { re, tribunal, fallback, tipo } of PADROES) {
      re.lastIndex = 0
      let m
      while ((m = re.exec(text)) !== null) {
        const s = m.index, e = m.index + m[0].length
        if (hits.some(h => h.s < e && h.e > s)) continue
        const trib = tribunal ?? _detectarTribunal(text, s, fallback ?? 'stj')
        hits.push({ s, e, raw: m[0], tribunal: trib, tipo: tipo ?? 'acordao', m })
      }
    }
    if (!hits.length) continue
    hits.sort((a, b) => a.s - b.s)
    const frag = document.createDocumentFragment()
    let cur = 0
    for (const h of hits) {
      if (h.s > cur) frag.appendChild(document.createTextNode(text.slice(cur, h.s)))
      const a = document.createElement('a')
      a.className   = 'julgado-link'
      a.textContent = h.raw
      a.href        = _urlJulgado(h)
      a.target      = '_blank'
      a.rel         = 'noopener noreferrer'
      a.title       = `Ver no ${h.tribunal.toUpperCase()}`
      frag.appendChild(a)
      cur = h.e
    }
    if (cur < text.length) frag.appendChild(document.createTextNode(text.slice(cur)))
    node.parentNode.replaceChild(frag, node)
  }
}
```

- [ ] **Step 2: Reabrir `test-julgados.html` no browser e confirmar que todos os testes passam**

Expected: `15 passed, 0 failed` em verde.

- [ ] **Step 3: Commit**

```bash
git add app.js
git commit -m "feat: add linkificarJulgados to auto-link STF/STJ citations"
```

---

## Task 4: Wiring — chamar `linkificarJulgados` nos dois pontos de carregamento

**Files:**
- Modify: `app.js:703` (dentro de `abrirTema`)
- Modify: `app.js:276` (dentro de `renderConteudoTurma`)

### 4a — `abrirTema`

- [ ] **Step 1: Inserir chamada em `abrirTema` (após o bloco de âncoras internas)**

Localizar o trecho (em torno de linha 703-705):

```javascript
      })
      // Injeta aba "Meu Espaço" se a página tem sistema de abas
      if (typeof MeuEspaco !== 'undefined') {
```

Substituir por:

```javascript
      })
      linkificarJulgados(area)
      // Injeta aba "Meu Espaço" se a página tem sistema de abas
      if (typeof MeuEspaco !== 'undefined') {
```

### 4b — `renderConteudoTurma`

- [ ] **Step 2: Inserir chamada em `renderConteudoTurma` (após o forEach de links do índice)**

Localizar o trecho (em torno de linha 273-278):

```javascript
        el.querySelectorAll('a[href]').forEach(a => {
          const href = a.getAttribute('href')
          if (href && !href.startsWith('http') && !href.startsWith('#')) {
            const arquivo = base + href
            const temaIndex = turma.temas.findIndex(t => t.arquivo === arquivo)
            if (temaIndex !== -1) {
              a.href = '#'
              a.onclick = (e) => { e.preventDefault(); abrirTema(temaIndex) }
            }
          }
        })
      })
      .catch(() => {
```

Substituir por:

```javascript
        el.querySelectorAll('a[href]').forEach(a => {
          const href = a.getAttribute('href')
          if (href && !href.startsWith('http') && !href.startsWith('#')) {
            const arquivo = base + href
            const temaIndex = turma.temas.findIndex(t => t.arquivo === arquivo)
            if (temaIndex !== -1) {
              a.href = '#'
              a.onclick = (e) => { e.preventDefault(); abrirTema(temaIndex) }
            }
          }
        })
        linkificarJulgados(el)
      })
      .catch(() => {
```

- [ ] **Step 3: Abrir o site localmente e verificar visualmente**

Abrir `index.html` no browser. Navegar até qualquer tema que contenha julgados (ex: Direito Penal IV → Crimes contra a Fé Pública). Confirmar:
- Citações como `HC 96.356/RS`, `REsp 1.740.921/GO` aparecem com sublinhado pontilhado
- Ao passar o mouse: sublinhado vira sólido, ícone ⚖ acende
- Clicar no link abre a busca do tribunal em nova aba
- Texto sem citação não é afetado

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: wire linkificarJulgados into abrirTema and renderConteudoTurma"
```

---

## Task 5: Limpeza

**Files:**
- Delete: `test-julgados.html`
- Delete: `preview-julgados.html`

- [ ] **Step 1: Remover arquivos temporários**

```bash
git rm test-julgados.html preview-julgados.html
git commit -m "chore: remove brainstorming preview and test files"
```

---

## Verificação final

Após a Task 5, abrir o site no GitHub Pages (ou localmente via Live Server) e:
1. Abrir um tema com julgados (ex: Penal IV → Crimes contra a Fé Pública)
2. Verificar que `REsp`, `HC`, `ADI`, `Súmula X STJ`, `SV X` estão linkados
3. Verificar que o hover funciona
4. Clicar num link e confirmar que a página de busca do tribunal abre
5. Verificar que textos sem citação (ex: títulos, parágrafos descritivos) não foram afetados
