# Card de Jurisprudência Expansível na Home — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Adicionar um card "Jurisprudência" expansível ao grid de matérias da home, permitindo ao aluno acessar os informativos STJ de qualquer área com 2 cliques a partir da home.

**Architecture:** O card é renderizado inline dentro de `renderArvore()` em `app.js` como um quarto item no `.materias-cards`. Um `<button>` de cabeçalho faz o toggle de uma classe CSS que mostra/esconde 3 botões de navegação. Ao clicar num botão, chama `selecionarTurma()` — mesmo fluxo da navegação normal. Nenhuma rota nova, nenhum arquivo de dados alterado.

**Tech Stack:** JavaScript vanilla (ES2020), CSS custom properties, HTML5 — sem build step, sem dependências.

## Global Constraints

- Não alterar `data.js` nem criar novas rotas no roteador do SPA
- Manter compatibilidade com dark mode (`data-theme="dark"` e `prefers-color-scheme: dark`)
- Manter compatibilidade com `prefers-reduced-motion`
- CSS usa somente variáveis já definidas em `:root` em `style.css`
- Funções novas em `app.js` são globais (sem módulos)
- Site hospedado no GitHub Pages — sem servidor, sem Node em runtime

---

### Task 1: Estilos CSS do card expansível

**Files:**
- Modify: `style.css:789` (após bloco `.card-materia-arrow`, antes de `/* ── Abas de turma ── */`)

**Interfaces:**
- Produces: classes `.card-jur`, `.card-jur--aberto`, `.card-jur-header`, `.card-jur-icon`, `.card-jur-text`, `.card-jur-titulo`, `.card-jur-sub`, `.card-jur-arrow`, `.card-jur-panel`, `.card-jur-opcao` — usadas pela Task 2

---

- [ ] **Step 1: Inserir bloco CSS em `style.css` após a linha 789**

Localizar a linha:
```css
.card-materia-arrow {
  color: var(--border);
  font-size: 20px;
  flex-shrink: 0;
}
```
(termina por volta da linha 788-789, antes do comentário `/* ── Abas de turma ── */`)

Inserir o bloco abaixo **imediatamente após** o fechamento do `.card-materia-arrow`:

```css

/* ── Card de Jurisprudência expansível ── */
.card-jur {
  grid-column: 1 / -1;
  border-radius: 12px;
  border: 1px solid var(--border);
  background: var(--surface);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  transition: box-shadow .2s, border-color .18s;
}

.card-jur--aberto {
  border-color: var(--blue-accent);
  box-shadow: var(--shadow-md);
}

.card-jur-header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 16px 18px;
  width: 100%;
  background: none;
  border: none;
  cursor: pointer;
  color: inherit;
  text-align: left;
  min-height: 72px;
  transition: background .15s;
}

.card-jur-header:hover {
  background: var(--blue-hover);
}

.card-jur-icon {
  width: 44px;
  height: 44px;
  background: var(--blue-light);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  flex-shrink: 0;
}

.card-jur-text {
  flex: 1;
  min-width: 0;
}

.card-jur-titulo {
  font-family: var(--serif);
  font-size: 14px;
  font-weight: 700;
  color: var(--blue);
  margin-bottom: 2px;
}

.card-jur-sub {
  font-size: 11px;
  color: var(--text2);
}

.card-jur-arrow {
  color: var(--border);
  font-size: 20px;
  flex-shrink: 0;
  transition: transform .2s;
}

.card-jur--aberto .card-jur-arrow {
  transform: rotate(90deg);
}

.card-jur-panel {
  display: none;
  padding: 0 18px 16px;
  gap: 10px;
  flex-wrap: wrap;
}

.card-jur--aberto .card-jur-panel {
  display: flex;
}

.card-jur-opcao {
  flex: 1 1 140px;
  padding: 10px 16px;
  background: var(--blue-light);
  border: 1px solid var(--blue-accent);
  border-radius: 8px;
  color: var(--blue);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: background .15s, color .15s, transform .15s;
  text-align: center;
}

.card-jur-opcao:hover {
  background: var(--blue-accent);
  color: #fff;
  transform: translateY(-1px);
}

.card-jur-opcao:active {
  transform: translateY(0);
}

@media (prefers-reduced-motion: reduce) {
  .card-jur,
  .card-jur-header,
  .card-jur-arrow,
  .card-jur-opcao {
    transition: none;
  }
  .card-jur-opcao:hover {
    transform: none;
  }
}
```

- [ ] **Step 2: Verificar visualmente no browser**

Abrir `index.html` no browser (ou acessar `https://vieira-artur.github.io/estudos-direito/` após deploy). Neste momento o card ainda não aparece (o JS não foi adicionado). Verificar apenas que nenhum estilo existente foi quebrado.

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "style: estilos do card de jurisprudência expansível na home"
```

---

### Task 2: HTML e lógica JS em `app.js`

**Files:**
- Modify: `app.js` — função `renderArvore()` (linha ~368–391) e bloco de funções globais logo após

**Interfaces:**
- Consumes (de tasks anteriores): classes CSS `.card-jur`, `.card-jur--aberto`, `.card-jur-header`, `.card-jur-icon`, `.card-jur-text`, `.card-jur-titulo`, `.card-jur-sub`, `.card-jur-arrow`, `.card-jur-panel`, `.card-jur-opcao`
- Consumes (já existentes em `app.js`): `materias` (array global de `data.js`), `estado` (objeto global), `selecionarTurma(materiaId, turmaId)`, `esc(str)`
- Produces: funções globais `toggleCardJur(event)`, `_fecharCardJurFora(e)`, `irJurisprudencia(materiaId, turmaId)`

---

- [ ] **Step 1: Adicionar o card HTML dentro de `renderArvore()`**

Localizar em `app.js` o trecho atual (linha ~375–388):

```javascript
  app.innerHTML = `
    <div class="hero">
      <div class="hero-sup">Prof. Artur Vieira</div>
      <h1>Material de apoio para os estudos de Direito</h1>
      <p class="hero-desc">Mapas mentais, roteiros de estudo e casos práticos organizados por disciplina. Selecione uma matéria para começar.</p>
    </div>
    <p class="secao-titulo">Matérias</p>
    <div class="materias-cards">
      ${materias.map(m => `
          <a class="card-materia" href="${BASE_PATH}${m.id}" data-spa
             aria-label="${esc(m.titulo)}">
            <div class="card-materia-icon">${m.icone}</div>
            <div class="card-materia-body">
              <div class="card-materia-titulo">${m.titulo}</div>
              <div class="card-materia-sub">${m.turmas.length} turma${m.turmas.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="card-materia-arrow" aria-hidden="true">›</div>
          </a>
        `).join('')}
    </div>
  `
```

Substituir pelo trecho abaixo (único acréscimo: o `.card-jur` antes do `</div>` que fecha `.materias-cards`):

```javascript
  app.innerHTML = `
    <div class="hero">
      <div class="hero-sup">Prof. Artur Vieira</div>
      <h1>Material de apoio para os estudos de Direito</h1>
      <p class="hero-desc">Mapas mentais, roteiros de estudo e casos práticos organizados por disciplina. Selecione uma matéria para começar.</p>
    </div>
    <p class="secao-titulo">Matérias</p>
    <div class="materias-cards">
      ${materias.map(m => `
          <a class="card-materia" href="${BASE_PATH}${m.id}" data-spa
             aria-label="${esc(m.titulo)}">
            <div class="card-materia-icon">${m.icone}</div>
            <div class="card-materia-body">
              <div class="card-materia-titulo">${m.titulo}</div>
              <div class="card-materia-sub">${m.turmas.length} turma${m.turmas.length !== 1 ? 's' : ''}</div>
            </div>
            <div class="card-materia-arrow" aria-hidden="true">›</div>
          </a>
        `).join('')}
      <div class="card-jur" id="card-jur">
        <button class="card-jur-header"
                aria-expanded="false"
                aria-controls="card-jur-panel"
                onclick="toggleCardJur(event)">
          <div class="card-jur-icon">📋</div>
          <div class="card-jur-text">
            <div class="card-jur-titulo">Jurisprudência</div>
            <div class="card-jur-sub">Atualizada toda segunda-feira</div>
          </div>
          <div class="card-jur-arrow" aria-hidden="true">›</div>
        </button>
        <div class="card-jur-panel" id="card-jur-panel"
             role="group" aria-label="Escolha a área">
          <button class="card-jur-opcao"
                  onclick="irJurisprudencia('penal','penal-informativos-stj')">Penal</button>
          <button class="card-jur-opcao"
                  onclick="irJurisprudencia('processual-penal','processual-penal-informativos-stj')">Proc. Penal</button>
          <button class="card-jur-opcao"
                  onclick="irJurisprudencia('tributario','tributario-informativos-stj')">Tributário</button>
        </div>
      </div>
    </div>
  `
```

- [ ] **Step 2: Adicionar as 3 funções globais logo após `renderArvore()`**

Localizar a linha onde `renderArvore()` termina (linha ~391, após o `}`). Inserir imediatamente após:

```javascript
function toggleCardJur(event) {
  if (event) event.stopPropagation()
  const card = document.getElementById('card-jur')
  if (!card) return
  const isOpen = card.classList.toggle('card-jur--aberto')
  card.querySelector('.card-jur-header').setAttribute('aria-expanded', String(isOpen))
  if (isOpen) {
    const first = card.querySelector('.card-jur-opcao')
    if (first) first.focus()
    document.addEventListener('click', _fecharCardJurFora)
  } else {
    document.removeEventListener('click', _fecharCardJurFora)
  }
}

function _fecharCardJurFora(e) {
  const card = document.getElementById('card-jur')
  if (!card || card.contains(e.target)) return
  card.classList.remove('card-jur--aberto')
  const header = card.querySelector('.card-jur-header')
  if (header) header.setAttribute('aria-expanded', 'false')
  document.removeEventListener('click', _fecharCardJurFora)
}

function irJurisprudencia(materiaId, turmaId) {
  document.removeEventListener('click', _fecharCardJurFora)
  const materia = materias.find(m => m.id === materiaId)
  const turma   = materia.turmas.find(t => t.id === turmaId)
  estado.materiaAtual = materia
  estado.turmaAtual   = turma
  selecionarTurma(materiaId, turmaId)
}
```

- [ ] **Step 3: Verificar no browser**

Abrir a home do site. Confirmar:
1. O card "Jurisprudência" aparece abaixo dos 3 cards de matéria, ocupando toda a largura da linha no grid (desktop) ou largura total (mobile)
2. Clicar no card → painel expande, seta gira 90°, `aria-expanded` vira `"true"`, foco vai para o botão "Penal"
3. Clicar no cabeçalho novamente → painel colapsa
4. Com painel aberto, clicar fora do card → painel colapsa
5. Clicar "Penal" → navega para o índice de informativos de Penal (mesmo destino de `penal > Jurisprudência`)
6. Clicar "Proc. Penal" → navega para o índice de informativos de Processual Penal
7. Clicar "Tributário" → navega para o índice de informativos de Tributário
8. Verificar dark mode: card e botões com cores corretas
9. Verificar breadcrumb e botão voltar após navegar por um dos botões

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat: card de jurisprudência expansível na home"
```

---

### Task 3: Deploy e verificação final

**Files:** nenhum arquivo novo

- [ ] **Step 1: Push para GitHub Pages**

```bash
git push origin master
```

- [ ] **Step 2: Verificar em produção**

Acessar `https://vieira-artur.github.io/estudos-direito/` (aguardar ~1 min para o Pages atualizar).
Repetir os 9 pontos de verificação do Task 2 Step 3 no ambiente de produção.

- [ ] **Step 3: Verificar no mobile**

Abrir no celular (ou DevTools > mobile view). Confirmar que os 3 botões internos se organizam em linha com quebra natural (flex-wrap), sem overflow horizontal.
