# Flashcard Histórico de Sessões — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Salvar o resultado de cada sessão de flashcard completa e exibi-lo na tela de resumo com tendência de desempenho.

**Architecture:** Três funções auxiliares puras adicionadas em `app.js` (`salvarHistoricoSessao`, `carregarHistorico`, `calcularTendencia`, `formatarDataSessao`). `avaliarCard` chama `salvarHistoricoSessao` ao completar a sessão. `renderFlashResumoHTML` recebe o histórico e renderiza o bloco. Dois seletores CSS novos em `style.css`.

**Tech Stack:** JavaScript vanilla, localStorage.

---

### Task 1: Funções auxiliares de histórico

**Files:**
- Modify: `app.js` — adicionar 4 funções após `flashcardsDoAluno` (linha ~320)

- [ ] **Passo 1: Localizar ponto de inserção**

Abrir `app.js`. A função `flashcardsDoAluno` está por volta da linha 320. As novas funções entram logo após o bloco de funções de flashcard do aluno (`salvarFlashcard`, `deletarFlashcard`), antes de `renderMeuDeckHTML`.

- [ ] **Passo 2: Inserir as 4 funções**

Após a função `deletarFlashcard` (que termina por volta da linha 336), inserir:

```js
function salvarHistoricoSessao(turmaId, acertos, total) {
  const key = `flashcards_historico_${turmaId}`
  const historico = carregarHistorico(turmaId)
  historico.unshift({ data: Date.now(), acertos, total })
  if (historico.length > 10) historico.pop()
  localStorage.setItem(key, JSON.stringify(historico))
}

function carregarHistorico(turmaId) {
  try {
    return JSON.parse(localStorage.getItem(`flashcards_historico_${turmaId}`) || '[]')
  } catch { return [] }
}

function calcularTendencia(historico) {
  if (historico.length < 3) return ''
  const ultima = Math.round((historico[0].acertos / historico[0].total) * 100)
  const media = Math.round(
    ((historico[1].acertos / historico[1].total) +
     (historico[2].acertos / historico[2].total)) / 2 * 100
  )
  if (ultima - media >= 5) return '↑'
  if (media - ultima >= 5) return '↓'
  return '→'
}

function formatarDataSessao(ts) {
  const agora = new Date()
  const d = new Date(ts)
  const mesmoDia = d.toDateString() === agora.toDateString()
  const ontem = new Date(agora)
  ontem.setDate(ontem.getDate() - 1)
  const diaAnterior = d.toDateString() === ontem.toDateString()
  const hhmm = d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
  if (mesmoDia)   return `Hoje, ${hhmm}`
  if (diaAnterior) return `Ontem, ${hhmm}`
  return d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
}
```

- [ ] **Passo 3: Verificar manualmente no browser**

Abrir o console do browser e testar:
```js
salvarHistoricoSessao('processual-penal-ii', 8, 10)
salvarHistoricoSessao('processual-penal-ii', 6, 10)
salvarHistoricoSessao('processual-penal-ii', 9, 10)
console.log(carregarHistorico('processual-penal-ii'))
// esperado: array com 3 objetos, mais recente primeiro
console.log(calcularTendencia(carregarHistorico('processual-penal-ii')))
// esperado: '↑' (9/10=90% vs média de 8/10+6/10=70% → +20pts)
console.log(formatarDataSessao(Date.now()))
// esperado: 'Hoje, HH:mm'
```

---

### Task 2: Salvar sessão ao completar

**Files:**
- Modify: `app.js` — função `avaliarCard` (~linha 468)

- [ ] **Passo 1: Localizar `avaliarCard`**

Localizar o bloco:
```js
  if (proximo >= todos.length) {
    area.innerHTML = renderFlashResumoHTML(acertos, todos.length)
    return
  }
```

- [ ] **Passo 2: Inserir chamada de save antes de renderizar o resumo**

Substituir:
```js
  if (proximo >= todos.length) {
    area.innerHTML = renderFlashResumoHTML(acertos, todos.length)
    return
  }
```

Por:
```js
  if (proximo >= todos.length) {
    salvarHistoricoSessao(turma.id, acertos, todos.length)
    area.innerHTML = renderFlashResumoHTML(acertos, todos.length, turma.id)
    return
  }
```

---

### Task 3: Exibir histórico na tela de resumo

**Files:**
- Modify: `app.js` — função `renderFlashResumoHTML` (~linha 488)

- [ ] **Passo 1: Atualizar assinatura e corpo da função**

Substituir a função inteira:
```js
function renderFlashResumoHTML(acertos, total) {
  const pct = Math.round((acertos / total) * 100)
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📖'
  const msg = pct >= 80
    ? 'Ótimo desempenho! Você está bem preparado.'
    : pct >= 50
      ? 'Bom progresso! Revise os cards que errou.'
      : 'Mais uma rodada vai ajudar. Continue!'

  return `
    <div class="flash-resumo">
      <div class="flash-resumo-emoji">${emoji}</div>
      <div class="flash-resumo-titulo">${acertos} de ${total} acertos (${pct}%)</div>
      <div class="flash-resumo-sub">${msg}</div>
      <button class="flash-resumo-btn" onclick="reiniciarSessao()">Reiniciar sessão</button>
    </div>
  `
}
```

Por:
```js
function renderFlashResumoHTML(acertos, total, turmaId) {
  const pct = Math.round((acertos / total) * 100)
  const emoji = pct >= 80 ? '🎉' : pct >= 50 ? '👍' : '📖'
  const msg = pct >= 80
    ? 'Ótimo desempenho! Você está bem preparado.'
    : pct >= 50
      ? 'Bom progresso! Revise os cards que errou.'
      : 'Mais uma rodada vai ajudar. Continue!'

  const historico = turmaId ? carregarHistorico(turmaId) : []
  const tendencia = calcularTendencia(historico)
  const ultimas = historico.slice(0, 5)

  const historicoHTML = ultimas.length === 0 ? '' : `
    <div class="flash-historico">
      <div class="flash-historico-titulo">Suas últimas sessões</div>
      ${ultimas.map((s, i) => {
        const spct = Math.round((s.acertos / s.total) * 100)
        const trend = i === 0 && tendencia ? `<span class="flash-trend flash-trend-${tendencia === '↑' ? 'up' : tendencia === '↓' ? 'down' : 'flat'}">${tendencia}</span>` : '<span class="flash-trend"></span>'
        return `
          <div class="flash-historico-linha">
            ${trend}
            <span class="flash-hist-data">${formatarDataSessao(s.data)}</span>
            <span class="flash-hist-pct">${spct}%</span>
            <span class="flash-hist-cards">${s.total} cards</span>
          </div>`
      }).join('')}
    </div>
  `

  return `
    <div class="flash-resumo">
      <div class="flash-resumo-emoji">${emoji}</div>
      <div class="flash-resumo-titulo">${acertos} de ${total} acertos (${pct}%)</div>
      <div class="flash-resumo-sub">${msg}</div>
      <button class="flash-resumo-btn" onclick="reiniciarSessao()">Reiniciar sessão</button>
      ${historicoHTML}
    </div>
  `
}
```

- [ ] **Passo 2: Verificar que `reiniciarSessao` não salva histórico**

Confirmar que `reiniciarSessao` apenas chama `renderFlashSessao` sem passar por `avaliarCard`. Nenhuma mudança necessária — já está correto.

---

### Task 4: CSS para o bloco de histórico

**Files:**
- Modify: `style.css` — após `.flash-resumo-btn:hover` (~linha 881)

- [ ] **Passo 1: Adicionar estilos**

Após `.flash-resumo-btn:hover { background: var(--blue-mid); }`, inserir:

```css
.flash-historico {
  margin-top: 20px;
  border-top: 1px solid var(--border);
  padding-top: 14px;
  width: 100%;
}
.flash-historico-titulo {
  font-size: 11px;
  font-weight: 600;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: .07em;
  margin-bottom: 10px;
}
.flash-historico-linha {
  display: grid;
  grid-template-columns: 20px 1fr auto auto;
  align-items: center;
  gap: 8px;
  padding: 5px 0;
  font-size: 13px;
  color: var(--text);
  border-bottom: 1px solid var(--border);
}
.flash-historico-linha:last-child { border-bottom: none; }
.flash-trend { font-size: 14px; font-weight: 700; text-align: center; }
.flash-trend-up   { color: #16A34A; }
.flash-trend-down { color: #DC2626; }
.flash-trend-flat { color: var(--text2); }
.flash-hist-data  { color: var(--text2); font-size: 12px; }
.flash-hist-pct   { font-weight: 600; }
.flash-hist-cards { font-size: 12px; color: var(--text2); }
```

- [ ] **Passo 2: Testar visualmente**

Abrir uma turma com flashcards (ex: Processual Penal II). Completar a sessão inteira clicando em "Sabia!" ou "Não sabia" em todos os cards. A tela de resumo deve mostrar o histórico com a sessão recém-salva. Completar mais 2 sessões e verificar que a tendência (↑ ↓ →) aparece corretamente na linha mais recente.

---

### Task 5: Commit final

- [ ] **Passo 1: Commit**

```bash
git add app.js style.css
git commit -m "feat: histórico de sessões nos flashcards

Salva resultado de cada sessão completa no localStorage.
Exibe últimas 5 sessões na tela de resumo com tendência (↑↓→)."
```
