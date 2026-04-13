# Evolução Visual + Flashcards — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Aplicar o redesign visual Moderno Profissional com layout mobile-first e adicionar sistema de flashcards por turma.

**Architecture:** Projeto SPA em HTML/CSS/JS puro sem framework. Etapa 1 (visual + mobile) refaz a tela inicial usando cards em vez da árvore horizontal e atualiza tokens de cor. Etapa 2 (flashcards) adiciona aba "Flashcards" em cada turma, com deck do professor definido em `data.js` e deck do aluno em `localStorage`. As etapas são independentes e sequenciais — Etapa 1 deve estar completa antes de iniciar a Etapa 2.

**Tech Stack:** HTML5, CSS3 (custom properties, media queries), JavaScript ES6+ (fetch, localStorage, template literals), GitHub Pages (site estático).

> **Nota sobre testes:** O projeto não tem framework de testes. As etapas de verificação são manuais via browser. Use o Chrome DevTools com emulação de mobile (iPhone 12 Pro — 390px) para verificar o layout responsivo.

---

## ETAPA 1 — Visual + Mobile

---

### Task 1: Atualizar tokens de cor e visual global

**Files:**
- Modify: `style.css` (linhas 1–22 e todas ocorrências de `var(--gold)` como acento primário)

- [ ] **Passo 1: Adicionar o token `--blue-accent` em `:root`**

Em `style.css`, adicione `--blue-accent: #4C9BE8;` logo após `--gold-light`:

```css
:root {
  --sk-base:  #e4eaf3;
  --sk-shine: #f2f5fb;
  --blue:        #1F497D;
  --blue-dark:   #162f52;
  --blue-mid:    #2c5f9e;
  --blue-light:  #dce6f1;
  --blue-hover:  #e8f0f8;
  --blue-accent: #4C9BE8;
  --gold:        #C9A84C;
  --gold-light:  #fdf6e3;
  --bg:          #f0f4f8;
  --surface:     #ffffff;
  --border:      #d0dcea;
  --text:        #1a1a2e;
  --text2:       #5a6478;
  --serif:       'Playfair Display', Georgia, serif;
  --sans:        'Source Sans 3', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  --shadow-sm:   0 2px 8px rgba(31,73,125,.10);
  --shadow-md:   0 4px 16px rgba(31,73,125,.14);
  --shadow-lg:   0 8px 32px rgba(31,73,125,.18);
}
```

- [ ] **Passo 2: Atualizar o header para usar blue-accent**

Localize o bloco `header { ... }` e altere `border-bottom`:

```css
header {
  background: linear-gradient(135deg, var(--blue-dark) 0%, var(--blue) 100%);
  color: white;
  padding: 14px 28px;
  position: sticky;
  top: 0;
  z-index: 10;
  box-shadow: 0 3px 16px rgba(0,0,0,.35);
  border-bottom: 3px solid var(--blue-accent);
}
```

- [ ] **Passo 3: Atualizar o `.hero` para usar border-left**

Localize `.hero { ... }` e troque `border-top: 3px solid var(--gold)` por `border-left`:

```css
.hero {
  position: relative;
  margin-bottom: 36px;
  padding: 32px 32px 28px 36px;
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 14px;
  border-left: 4px solid var(--blue-accent);
  box-shadow: var(--shadow-sm);
  overflow: hidden;
  animation: fadeUp .45s ease both;
}
```

- [ ] **Passo 4: Atualizar `.hero-sup` e `.secao-titulo::before`**

```css
.hero-sup {
  font-family: var(--sans);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: .12em;
  text-transform: uppercase;
  color: var(--blue-accent);
  margin-bottom: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-sup::before {
  content: '';
  width: 20px;
  height: 1.5px;
  background: var(--blue-accent);
  border-radius: 2px;
}
```

E `.secao-titulo::before`:

```css
.secao-titulo::before {
  content: '';
  width: 3px;
  height: 18px;
  background: var(--blue-accent);
  border-radius: 2px;
  flex-shrink: 0;
}
```

- [ ] **Passo 5: Atualizar acentos dourados nos nós da árvore**

```css
.no-materia::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--blue-accent);
  opacity: .7;
}

.progresso-turma {
  font-size: 11px;
  font-weight: 600;
  background: var(--blue-accent);
  color: #fff;
  border-radius: 10px;
  padding: 1px 7px;
  line-height: 1.6;
  flex-shrink: 0;
}

.no-tema::before {
  content: '›';
  position: absolute;
  left: 11px;
  color: var(--blue-accent);
  font-size: 16px;
  top: 50%;
  transform: translateY(-50%);
  opacity: 0;
  transition: opacity .18s, left .18s;
  font-weight: bold;
}

.no-tema.visitado {
  border-left: 2px solid var(--blue-accent);
}

.no-tema.visitado::after {
  content: '✓';
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--blue-accent);
  font-size: 13px;
  font-weight: 700;
}
```

- [ ] **Passo 6: Atualizar dark mode com --blue-accent**

Dentro de `@media (prefers-color-scheme: dark)`, adicione:

```css
--blue-accent: #6abaff;
```

- [ ] **Passo 7: Atualizar `.card-tema::after` (remover gradiente com gold)**

```css
.card-tema::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--blue-accent);
  opacity: 0;
  transition: opacity .2s;
}
```

- [ ] **Passo 8: Atualizar breadcrumb hover**

```css
#breadcrumb .crumb:hover { color: white; border-color: var(--blue-accent); }
#breadcrumb .crumb-atual {
  color: var(--blue-accent);
  font-weight: 600;
  cursor: default;
  text-decoration: none;
}
```

- [ ] **Passo 9: Verificar no browser**

Abra `index.html` no browser. Confirme:
- Header tem borda azul-vivo (não dourada)
- Hero tem borda esquerda azul-vivo
- Breadcrumb ativo em azul-vivo

- [ ] **Passo 10: Commit**

```bash
git add style.css
git commit -m "style: substitui acento dourado por --blue-accent em tokens e componentes globais"
```

---

### Task 2: Substituir tela inicial por layout de cards mobile-first

**Files:**
- Modify: `style.css` (adicionar `.materias-cards`, `.card-materia`, `.barra-progresso`)
- Modify: `app.js` (reescrever `renderArvore()`)

- [ ] **Passo 1: Adicionar CSS para `.materias-cards` e `.card-materia`**

Adicione ao final de `style.css`, antes do bloco `@media (prefers-color-scheme: dark)`:

```css
/* ── Tela inicial: cards de matéria (mobile-first) ── */
.materias-cards {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeUp .35s ease both;
}

@media (min-width: 640px) {
  .materias-cards {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 16px;
  }
}

.card-materia {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  box-shadow: var(--shadow-sm);
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 14px;
  transition: box-shadow .2s, transform .18s, border-color .18s;
  min-height: 72px;
}

.card-materia:hover {
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
  border-color: var(--blue-light);
}

.card-materia-icon {
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

.card-materia-body {
  flex: 1;
  min-width: 0;
}

.card-materia-titulo {
  font-family: var(--serif);
  font-size: 14px;
  font-weight: 700;
  color: var(--blue);
  margin-bottom: 2px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.card-materia-sub {
  font-size: 11px;
  color: var(--text2);
  margin-bottom: 6px;
}

.card-materia-arrow {
  color: var(--border);
  font-size: 20px;
  flex-shrink: 0;
}

/* Barra de progresso genérica */
.barra-progresso {
  height: 4px;
  background: var(--blue-light);
  border-radius: 2px;
  overflow: hidden;
}

.barra-progresso-fill {
  height: 100%;
  background: var(--blue-accent);
  border-radius: 2px;
  transition: width .3s ease;
}

.barra-progresso-label {
  font-size: 10px;
  color: var(--text2);
  margin-top: 3px;
}
```

- [ ] **Passo 2: Reescrever `renderArvore()` em `app.js`**

Substitua a função `renderArvore` inteira pela versão abaixo:

```js
function renderArvore(fromPop = false) {
  estado.materiaAtual = null
  estado.turmaAtual   = null
  document.title = 'Estudos Complementares — Prof. Artur Vieira'
  atualizarBreadcrumb()
  if (!fromPop) history.pushState({ view: 'materias' }, '')
  window.scrollTo(0, 0)

  app.innerHTML = `
    <div class="hero">
      <div class="hero-sup">Prof. Artur Vieira</div>
      <h1>Material de apoio para os estudos de Direito</h1>
      <p class="hero-desc">Mapas mentais, roteiros de estudo e casos práticos organizados por disciplina. Selecione uma matéria para começar.</p>
    </div>
    <p class="secao-titulo">Matérias</p>
    <div class="materias-cards">
      ${materias.map(m => {
        const totalTemas = m.turmas.reduce((acc, t) => acc + t.temas.length, 0)
        const totalVisitados = m.turmas.reduce((acc, t) =>
          acc + t.temas.filter(tema => visitados.has(tema.arquivo)).length, 0)
        const pct = totalTemas > 0 ? Math.round(totalVisitados / totalTemas * 100) : 0
        return `
          <div class="card-materia" role="button" tabindex="0"
               onclick="selecionarMateria('${m.id}')"
               onkeydown="if(event.key==='Enter'||event.key===' '){event.preventDefault();selecionarMateria('${m.id}')}">
            <div class="card-materia-icon">${m.icone}</div>
            <div class="card-materia-body">
              <div class="card-materia-titulo">${m.titulo}</div>
              <div class="card-materia-sub">${m.turmas.length} turma${m.turmas.length !== 1 ? 's' : ''}</div>
              ${totalTemas > 0 ? `
                <div class="barra-progresso">
                  <div class="barra-progresso-fill" style="width:${pct}%"></div>
                </div>
                <div class="barra-progresso-label">${totalVisitados} de ${totalTemas} temas lidos</div>
              ` : ''}
            </div>
            <div class="card-materia-arrow">›</div>
          </div>
        `
      }).join('')}
    </div>
  `
}
```

- [ ] **Passo 3: Verificar no browser (desktop)**

Abra `index.html`. A tela inicial deve mostrar 3 cards (Penal, Processual, Tributário) em grid de 3 colunas. Clique em cada um e confirme que a navegação funciona normalmente.

- [ ] **Passo 4: Verificar no browser (mobile)**

Abra DevTools → Toggle device toolbar → iPhone 12 Pro (390px). Os cards devem aparecer em coluna única, sem scroll horizontal. Toque targets visíveis e acessíveis.

- [ ] **Passo 5: Commit**

```bash
git add style.css app.js
git commit -m "feat(home): substitui árvore horizontal por cards mobile-first"
```

---

### Task 3: Header responsivo para mobile

**Files:**
- Modify: `index.html`
- Modify: `style.css`

- [ ] **Passo 1: Atualizar o HTML do header em `index.html`**

Substitua o bloco `<header>` pelo abaixo — adiciona `.site-titulo-short` para mobile:

```html
<header>
  <div class="header-top">
    <div class="site-titulo">
      <span class="site-titulo-full">Estudos Complementares — Prof. Artur Vieira</span>
      <span class="site-titulo-short">Estudos Complementares</span>
    </div>
    <a href="#" class="btn-sobre" onclick="abrirSobre(); return false;">Sobre mim</a>
  </div>
  <nav id="breadcrumb"></nav>
</header>
```

- [ ] **Passo 2: Adicionar CSS para título responsivo**

Em `style.css`, localize `.site-titulo` e adicione logo abaixo:

```css
.site-titulo-short { display: none; }

@media (max-width: 540px) {
  .site-titulo-full { display: none; }
  .site-titulo-short { display: inline; }

  header { padding: 12px 16px; }

  .btn-sobre {
    font-size: 11px;
    padding: 4px 10px;
  }

  main { padding: 20px 14px; }
}
```

- [ ] **Passo 3: Verificar no browser (mobile)**

Em 390px, o header deve mostrar "Estudos Complementares" (sem o nome do professor). Em desktop, deve mostrar o título completo.

- [ ] **Passo 4: Commit**

```bash
git add index.html style.css
git commit -m "style(header): título responsivo — versão curta em mobile"
```

---

### Task 4: Layout mobile-first nas telas de turma e tema

**Files:**
- Modify: `style.css` (`.cards-turmas`, `.card-turma`, `.cards-temas`, `.card-tema`)

- [ ] **Passo 1: Tornar `.cards-turmas` responsivo**

Localize `.cards-turmas` e substitua por:

```css
.cards-turmas {
  display: flex;
  flex-direction: column;
  gap: 10px;
  animation: fadeUp .35s ease both;
}

@media (min-width: 480px) {
  .cards-turmas {
    flex-direction: row;
    flex-wrap: wrap;
  }
}
```

- [ ] **Passo 2: Atualizar `.card-turma` para touch target adequado**

```css
.card-turma {
  background: var(--surface);
  border: 1px solid var(--border);
  border-left: 4px solid var(--blue-accent);
  border-radius: 10px;
  padding: 16px 20px;
  font-weight: 700;
  font-size: 14px;
  color: var(--blue);
  cursor: pointer;
  transition: background .18s, box-shadow .18s, transform .15s;
  box-shadow: var(--shadow-sm);
  min-height: 56px;
  display: flex;
  align-items: center;
  flex: 1 1 200px;
}

.card-turma:hover {
  background: var(--blue-hover);
  box-shadow: var(--shadow-md);
  transform: translateY(-2px);
}

.card-turma::before { display: none; }
```

- [ ] **Passo 3: Tornar `.cards-temas` responsivo**

```css
.cards-temas {
  display: flex;
  flex-direction: column;
  gap: 12px;
  animation: fadeUp .35s ease both;
}

@media (min-width: 540px) {
  .cards-temas {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
    gap: 14px;
  }
}
```

- [ ] **Passo 4: Atualizar `.card-tema`**

```css
.card-tema {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 12px;
  padding: 16px 18px;
  cursor: pointer;
  box-shadow: var(--shadow-sm);
  transition: transform .18s, box-shadow .18s, border-color .18s;
  position: relative;
  overflow: hidden;
  min-height: 72px;
  max-width: none;
}

.card-tema::after {
  content: '';
  position: absolute;
  bottom: 0; left: 0; right: 0;
  height: 3px;
  background: var(--blue-accent);
  opacity: 0;
  transition: opacity .2s;
}

.card-tema:hover {
  transform: translateY(-3px);
  box-shadow: var(--shadow-lg);
  border-color: var(--blue-light);
}

.card-tema:hover::after { opacity: 1; }

.card-tema .icone { font-size: 22px; margin-bottom: 10px; }
.card-tema .nome {
  font-family: var(--serif);
  font-weight: 700;
  font-size: 14px;
  margin-bottom: 5px;
  line-height: 1.35;
  color: var(--blue);
}
.card-tema .descricao { font-size: 12px; color: var(--text2); line-height: 1.5; }
```

- [ ] **Passo 5: Garantir que `#conteudo-area` é legível em mobile**

```css
#conteudo-area {
  background: var(--surface);
  border-radius: 12px;
  padding: 24px 20px;
  box-shadow: var(--shadow-md);
  animation: fadeUp .3s ease both;
  max-width: 860px;
  margin-left: auto;
  margin-right: auto;
}

@media (min-width: 640px) {
  #conteudo-area { padding: 32px; }
}
```

- [ ] **Passo 6: Verificar no browser (mobile)**

Em 390px: entre em Direito Penal IV → selecione um tema. O conteúdo deve ser legível sem scroll horizontal. Volte, entre em Processual Penal → as turmas devem aparecer em coluna em mobile.

- [ ] **Passo 7: Commit**

```bash
git add style.css
git commit -m "style: layout mobile-first para cards de turma e tema"
```

---

## ETAPA 2 — Flashcards

---

### Task 5: Estrutura de dados dos flashcards em `data.js`

**Files:**
- Modify: `data.js`

- [ ] **Passo 1: Adicionar `flashcards` em `penal-iv`**

Em `data.js`, dentro do objeto com `id: "penal-iv"`, adicione o campo `flashcards` após `temas`:

```js
{
  id: "penal-iv",
  titulo: "Direito Penal IV",
  indice: "conteudo/penal/penal-iv/index.html",
  temas: [ /* ... existente ... */ ],
  flashcards: [
    {
      frente: "Qual o bem jurídico protegido pelos crimes contra a Fé Pública?",
      verso: "A confiança e a credibilidade da sociedade na autenticidade de documentos, moeda e símbolos públicos."
    },
    {
      frente: "O que é falsidade material?",
      verso: "Alteração física do documento — rasura, adulteração, contrafação ou supressão."
    },
    {
      frente: "O que é falsidade ideológica (Art. 299 CP)?",
      verso: "Omissão ou inserção de declaração falsa em documento verdadeiro, com fim de criar obrigação, alterar a verdade ou prejudicar direito."
    },
    {
      frente: "Qual a diferença entre peculato-apropriação e peculato-furto?",
      verso: "No peculato-apropriação (Art. 312 caput), o funcionário já tem a posse do bem. No peculato-furto (§1º), o agente subtrai o bem aproveitando-se da facilidade do cargo."
    },
    {
      frente: "O que é peculato culposo (Art. 312 §2º CP)?",
      verso: "Ocorre quando o funcionário facilita, por negligência, a subtração ou apropriação indevida por terceiro. Admite extinção da punibilidade pela reparação do dano antes da sentença irrecorrível."
    }
  ]
}
```

- [ ] **Passo 2: Adicionar `flashcards` em `processual-penal-ii`**

```js
{
  id: "processual-penal-ii",
  titulo: "Direito Processual Penal II",
  indice: "conteudo/processual-penal-ii/index.html",
  temas: [ /* ... existente ... */ ],
  flashcards: [
    {
      frente: "Qual a diferença entre prova e elemento informativo?",
      verso: "Prova é produzida sob contraditório judicial. Elemento informativo (ex: inquérito policial) prescinde do contraditório e serve apenas para formar a opinio delicti."
    },
    {
      frente: "O que é prova ilícita por derivação (teoria dos frutos da árvore envenenada)?",
      verso: "São provas obtidas a partir de uma prova ilícita originária. São inadmissíveis salvo quando: (a) não evidenciado nexo causal; (b) obtidas por fonte independente; (c) poderia ser descoberta por outra via (descoberta inevitável)."
    },
    {
      frente: "Quais são os pressupostos da prisão preventiva?",
      verso: "Fumus commissi delicti (indícios de autoria e materialidade) + periculum libertatis (garantia da ordem pública, ordem econômica, conveniência da instrução ou aplicação da lei penal). Não cabe de ofício — exige requerimento ou representação."
    },
    {
      frente: "Por quanto tempo pode durar a prisão temporária em crime hediondo?",
      verso: "30 dias, prorrogável por mais 30 em caso de extrema necessidade (Lei 7.960/89, art. 2º, §4º). Para crimes comuns: 5 + 5 dias."
    }
  ]
}
```

- [ ] **Passo 3: Adicionar `flashcards` em `tributario-financeiro-i`**

```js
{
  id: "tributario-financeiro-i",
  titulo: "Direito Tributário e Financeiro I",
  temas: [ /* ... existente ... */ ],
  flashcards: [
    {
      frente: "Quais são as modalidades de extinção do crédito tributário (Art. 156 CTN)?",
      verso: "Pagamento, compensação, transação, remissão, prescrição, decadência, conversão de depósito em renda, pagamento antecipado + homologação, consignação em pagamento, decisão administrativa/judicial irreformável, dação em pagamento de bens imóveis."
    },
    {
      frente: "Qual a diferença entre decadência e prescrição tributária?",
      verso: "Decadência: extinção do direito de constituir o crédito tributário (prazo para lançamento — Art. 173 CTN). Prescrição: extinção do direito de cobrar o crédito já constituído (5 anos da constituição definitiva — Art. 174 CTN)."
    },
    {
      frente: "O que é substituição tributária para frente (progressiva)?",
      verso: "O fato gerador ainda não ocorreu, mas o tributo é recolhido antecipadamente pelo substituto (ex: fabricante recolhe ICMS do varejista). Admitida pelo Art. 150 §7º CF. Se o fato não ocorrer, garante-se a restituição."
    }
  ]
}
```

- [ ] **Passo 4: Verificar estrutura no browser (console)**

Abra `index.html`, abra o console do browser e execute:

```js
materias.flatMap(m => m.turmas).filter(t => t.flashcards).map(t => `${t.id}: ${t.flashcards.length} cards`)
```

Resultado esperado:
```
["penal-iv: 5 cards", "processual-penal-ii: 4 cards", "tributario-financeiro-i: 3 cards"]
```

- [ ] **Passo 5: Commit**

```bash
git add data.js
git commit -m "feat(data): adiciona flashcards iniciais nas turmas com conteúdo"
```

---

### Task 6: Aba Flashcards na tela de turma — estrutura e CSS

**Files:**
- Modify: `style.css` (adicionar estilos de tab e flashcard)
- Modify: `app.js` (adicionar sistema de abas em `selecionarTurma`)

- [ ] **Passo 1: Adicionar CSS de abas e componente flashcard em `style.css`**

Adicione ao final de `style.css` (antes do bloco dark mode):

```css
/* ── Abas de turma ── */
.turma-tabs {
  display: flex;
  border-bottom: 2px solid var(--border);
  margin-bottom: 20px;
  overflow-x: auto;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
  gap: 0;
}

.turma-tabs::-webkit-scrollbar { display: none; }

.turma-tab {
  padding: 10px 18px;
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  white-space: nowrap;
  border-bottom: 2px solid transparent;
  margin-bottom: -2px;
  cursor: pointer;
  transition: color .15s, border-color .15s;
  background: none;
  border-top: none;
  border-left: none;
  border-right: none;
  font-family: var(--sans);
}

.turma-tab:hover { color: var(--blue); }
.turma-tab.ativa { color: var(--blue); border-bottom-color: var(--blue-accent); }

/* ── Sessão de flashcard ── */
.flash-sessao { animation: fadeUp .3s ease both; }

.flash-deck-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 14px;
}

.flash-deck-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: .07em;
}

.flash-contador {
  font-size: 12px;
  color: var(--text2);
  background: var(--blue-light);
  padding: 3px 10px;
  border-radius: 20px;
}

.flash-card {
  background: linear-gradient(135deg, var(--blue-dark), var(--blue));
  border-radius: 14px;
  padding: 28px 24px;
  text-align: center;
  color: white;
  min-height: 140px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  cursor: pointer;
  margin-bottom: 14px;
  box-shadow: var(--shadow-md);
  transition: transform .15s;
  user-select: none;
}

.flash-card:active { transform: scale(.98); }

.flash-card-label {
  font-size: 10px;
  color: rgba(255,255,255,.55);
  text-transform: uppercase;
  letter-spacing: .1em;
}

.flash-card-texto {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.5;
}

.flash-card-dica {
  font-size: 11px;
  color: rgba(255,255,255,.4);
  margin-top: 4px;
}

.flash-acoes {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-bottom: 16px;
}

.flash-btn {
  font-size: 13px;
  font-weight: 600;
  padding: 10px 22px;
  border-radius: 20px;
  border: none;
  cursor: pointer;
  font-family: var(--sans);
  transition: opacity .15s;
}

.flash-btn:disabled { opacity: .4; cursor: default; }
.flash-btn-ver { background: var(--blue-light); color: var(--blue); }
.flash-btn-nao { background: #FEE2E2; color: #DC2626; }
.flash-btn-sim { background: #DCFCE7; color: #16A34A; }

.flash-barra-wrap { margin-bottom: 20px; }
.flash-barra-progresso {
  height: 6px;
  background: var(--blue-light);
  border-radius: 3px;
  overflow: hidden;
}
.flash-barra-fill {
  height: 100%;
  background: var(--blue-accent);
  border-radius: 3px;
  transition: width .3s ease;
}
.flash-barra-label {
  font-size: 11px;
  color: var(--text2);
  margin-top: 4px;
  display: flex;
  justify-content: space-between;
}

/* Resumo final */
.flash-resumo {
  text-align: center;
  padding: 32px 16px;
  animation: fadeUp .3s ease both;
}

.flash-resumo-emoji { font-size: 48px; margin-bottom: 12px; }
.flash-resumo-titulo {
  font-family: var(--serif);
  font-size: 22px;
  font-weight: 700;
  color: var(--blue);
  margin-bottom: 8px;
}
.flash-resumo-sub { font-size: 14px; color: var(--text2); margin-bottom: 24px; }
.flash-resumo-btn {
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 20px;
  padding: 11px 28px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--sans);
  transition: background .2s;
}
.flash-resumo-btn:hover { background: var(--blue-mid); }

/* Meu Deck */
.meu-deck-secao { margin-top: 24px; }
.meu-deck-titulo {
  font-size: 13px;
  font-weight: 600;
  color: var(--text2);
  text-transform: uppercase;
  letter-spacing: .07em;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
}
.meu-deck-titulo::after { content: ''; flex: 1; height: 1px; background: var(--border); }

.flash-card-usuario {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 10px;
  padding: 12px 14px;
  margin-bottom: 8px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.flash-card-usuario-corpo { flex: 1; min-width: 0; }
.flash-card-usuario-frente { font-size: 13px; font-weight: 600; color: var(--text); margin-bottom: 3px; }
.flash-card-usuario-verso { font-size: 12px; color: var(--text2); }

.flash-btn-deletar {
  background: none;
  border: none;
  color: var(--text2);
  font-size: 16px;
  cursor: pointer;
  padding: 2px 4px;
  flex-shrink: 0;
  transition: color .15s;
}
.flash-btn-deletar:hover { color: #DC2626; }

/* Formulário de novo card */
.flash-form {
  border: 1.5px dashed var(--border);
  border-radius: 10px;
  padding: 14px;
  margin-top: 10px;
}

.flash-form-titulo {
  font-size: 12px;
  font-weight: 600;
  color: var(--text2);
  margin-bottom: 10px;
}

.flash-input {
  width: 100%;
  padding: 9px 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  font-size: 13px;
  font-family: var(--sans);
  color: var(--text);
  background: var(--surface);
  margin-bottom: 8px;
  resize: vertical;
  min-height: 40px;
}

.flash-input:focus {
  outline: none;
  border-color: var(--blue-accent);
  box-shadow: 0 0 0 3px rgba(76,155,232,.15);
}

.flash-form-acoes { display: flex; justify-content: flex-end; gap: 8px; }
.flash-btn-salvar {
  background: var(--blue);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 18px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--sans);
}
.flash-btn-cancelar {
  background: var(--blue-light);
  color: var(--blue);
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  font-family: var(--sans);
}
```

- [ ] **Passo 2: Reescrever `selecionarTurma()` em `app.js` para suportar abas**

Substitua a função `selecionarTurma` inteira:

```js
function selecionarTurma(materiaId, turmaId, fromPop = false) {
  const materia = materias.find(m => m.id === materiaId)
  const turma   = materia.turmas.find(t => t.id === turmaId)
  estado.materiaAtual = materia
  estado.turmaAtual   = turma
  document.title = `${turma.titulo} — ${materia.titulo}`
  atualizarBreadcrumb()
  if (!fromPop) history.pushState({ view: 'turma', materiaId, turmaId }, '')
  window.scrollTo(0, 0)

  const temFlashcards = turma.flashcards && turma.flashcards.length > 0

  app.innerHTML = `
    <p class="secao-titulo">${turma.titulo}</p>
    ${temFlashcards ? `
      <div class="turma-tabs" id="turma-tabs">
        <button class="turma-tab ativa" id="tab-conteudo" onclick="mostrarTabConteudo()">📚 Conteúdo</button>
        <button class="turma-tab" id="tab-flash" onclick="mostrarTabFlash()">🃏 Flashcards</button>
      </div>
    ` : ''}
    <div id="tab-area-conteudo"></div>
    <div id="tab-area-flash" style="display:none"></div>
  `

  renderConteudoTurma(turma)
}
```

- [ ] **Passo 3: Adicionar `renderConteudoTurma()` em `app.js`**

Adicione esta nova função após `selecionarTurma`:

```js
function renderConteudoTurma(turma) {
  const area = document.getElementById('tab-area-conteudo')
  if (!area) return

  if (turma.indice) {
    area.innerHTML = skeletonConteudo()
    fetch(turma.indice)
      .then(r => {
        if (!r.ok) throw new Error('Arquivo não encontrado')
        return r.text()
      })
      .then(html => {
        const el = document.getElementById('conteudo-area')
        if (!el) return
        el.innerHTML = html
        el.style.animation = 'none'
        void el.offsetWidth
        el.style.removeProperty('animation')
        const base = turma.indice.substring(0, turma.indice.lastIndexOf('/') + 1)
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
        const el = document.getElementById('conteudo-area')
        if (el) el.innerHTML = `<p style="color:#c00">Não foi possível carregar o índice.<br>Verifique se o arquivo <code>${turma.indice}</code> existe.</p>`
      })
    return
  }

  area.innerHTML = `
    <div class="cards-temas">
      ${turma.temas.map((tema, i) => `
        <div class="card-tema" onclick="abrirTema(${i})">
          <div class="icone">📓</div>
          <div class="nome">${tema.titulo}</div>
          <div class="descricao">${tema.descricao}</div>
        </div>
      `).join('')}
    </div>
  `
}
```

- [ ] **Passo 4: Adicionar `mostrarTabConteudo()` e `mostrarTabFlash()` em `app.js`**

Adicione estas funções após `renderConteudoTurma`:

```js
function mostrarTabConteudo() {
  document.getElementById('tab-area-conteudo').style.display = ''
  document.getElementById('tab-area-flash').style.display = 'none'
  document.getElementById('tab-conteudo')?.classList.add('ativa')
  document.getElementById('tab-flash')?.classList.remove('ativa')
}

function mostrarTabFlash() {
  document.getElementById('tab-area-conteudo').style.display = 'none'
  document.getElementById('tab-area-flash').style.display = ''
  document.getElementById('tab-conteudo')?.classList.remove('ativa')
  document.getElementById('tab-flash')?.classList.add('ativa')
  renderFlashSessao(estado.turmaAtual)
}
```

- [ ] **Passo 5: Verificar abas no browser**

Abra `index.html` → Direito Penal → Direito Penal IV. Deve aparecer duas abas ("Conteúdo" e "Flashcards"). Clique em cada uma — Conteúdo mostra o índice existente; Flashcards mostra a `#tab-area-flash` (ainda vazia, renderizada no próximo task).

- [ ] **Passo 6: Commit**

```bash
git add style.css app.js
git commit -m "feat(flash): estrutura de abas e CSS de flashcard"
```

---

### Task 7: Sessão de flashcard e tela de resumo

**Files:**
- Modify: `app.js`

- [ ] **Passo 1: Adicionar `renderFlashSessao()` em `app.js`**

Adicione após `mostrarTabFlash`:

```js
function renderFlashSessao(turma) {
  const area = document.getElementById('tab-area-flash')
  if (!area) return

  const cardsProf = turma.flashcards || []
  const cardsAluno = flashcardsDoAluno(turma.id)
  const todos = [...cardsProf, ...cardsAluno]

  if (todos.length === 0) {
    area.innerHTML = `
      <div class="flash-sessao" style="text-align:center;padding:32px 16px">
        <div style="font-size:36px;margin-bottom:12px">🃏</div>
        <p style="color:var(--text2);font-size:14px">Nenhum flashcard ainda nesta turma.</p>
      </div>
      ${renderMeuDeckHTML(turma)}
    `
    return
  }

  area.innerHTML = `
    <div class="flash-sessao" id="flash-sessao-area">
      ${renderCardHTML(todos, 0, 0, false)}
    </div>
    ${renderMeuDeckHTML(turma)}
  `
}

function renderCardHTML(todos, index, acertos, virado) {
  const card = todos[index]
  const total = todos.length
  const pct = Math.round((index / total) * 100)

  return `
    <div class="flash-deck-header">
      <span class="flash-deck-label">${index < (estado.turmaAtual?.flashcards?.length || 0) ? 'Deck do Professor' : 'Meu Deck'}</span>
      <span class="flash-contador">Card ${index + 1} de ${total}</span>
    </div>
    <div class="flash-barra-wrap">
      <div class="flash-barra-progresso"><div class="flash-barra-fill" style="width:${pct}%"></div></div>
      <div class="flash-barra-label"><span>${index} vistos</span><span>${acertos} acertos</span></div>
    </div>
    <div class="flash-card" onclick="virarCard(${JSON.stringify(todos).split('"').join("'")})" id="flash-card-atual">
      <div class="flash-card-label">${virado ? 'Resposta' : 'Pergunta'}</div>
      <div class="flash-card-texto">${virado ? card.verso : card.frente}</div>
      ${!virado ? '<div class="flash-card-dica">toque para revelar</div>' : ''}
    </div>
    <div class="flash-acoes">
      ${virado ? `
        <button class="flash-btn flash-btn-nao" onclick="avaliarCard(false, ${index}, ${acertos}, '${estado.turmaAtual.id}')">✗ Não sabia</button>
        <button class="flash-btn flash-btn-sim" onclick="avaliarCard(true, ${index}, ${acertos}, '${estado.turmaAtual.id}')">✓ Sabia!</button>
      ` : `
        <button class="flash-btn flash-btn-ver" onclick="virarCard()">Ver resposta</button>
      `}
    </div>
  `
}
```

- [ ] **Passo 2: Adicionar `virarCard()` e `avaliarCard()` em `app.js`**

```js
function virarCard() {
  const area = document.getElementById('flash-sessao-area')
  if (!area) return
  const turma = estado.turmaAtual
  const cardsProf = turma.flashcards || []
  const cardsAluno = flashcardsDoAluno(turma.id)
  const todos = [...cardsProf, ...cardsAluno]

  // Lê o índice atual do atributo data do container
  const indexAtual = parseInt(area.dataset.index || '0')
  const acertosAtual = parseInt(area.dataset.acertos || '0')

  area.innerHTML = renderCardHTML(todos, indexAtual, acertosAtual, true)
  area.dataset.index = indexAtual
  area.dataset.acertos = acertosAtual
}

function avaliarCard(acertou, index, acertos, turmaId) {
  const turma = estado.turmaAtual
  const cardsProf = turma.flashcards || []
  const cardsAluno = flashcardsDoAluno(turmaId)
  const todos = [...cardsProf, ...cardsAluno]
  const novosAcertos = acertos + (acertou ? 1 : 0)
  const proximoIndex = index + 1

  const area = document.getElementById('flash-sessao-area')
  if (!area) return

  if (proximoIndex >= todos.length) {
    area.innerHTML = renderFlashResumoHTML(novosAcertos, todos.length, turmaId)
    return
  }

  area.innerHTML = renderCardHTML(todos, proximoIndex, novosAcertos, false)
  area.dataset.index = proximoIndex
  area.dataset.acertos = novosAcertos
}
```

- [ ] **Passo 3: Corrigir `renderCardHTML` para usar data attributes**

O onclick de `virarCard` não pode receber o array serializado diretamente (muito verboso e inseguro). Simplifique usando o estado já guardado no `area.dataset`:

Substitua as duas funções `renderCardHTML` e `virarCard` pela versão corrigida:

```js
function renderCardHTML(todos, index, acertos, virado) {
  const card = todos[index]
  const total = todos.length
  const pct = Math.round((index / total) * 100)
  const profCount = estado.turmaAtual?.flashcards?.length || 0

  return `
    <div class="flash-deck-header">
      <span class="flash-deck-label">${index < profCount ? 'Deck do Professor' : 'Meu Deck'}</span>
      <span class="flash-contador">Card ${index + 1} de ${total}</span>
    </div>
    <div class="flash-barra-wrap">
      <div class="flash-barra-progresso"><div class="flash-barra-fill" style="width:${pct}%"></div></div>
      <div class="flash-barra-label"><span>${index} vistos</span><span>${acertos} acertos</span></div>
    </div>
    <div class="flash-card" onclick="virarCard()">
      <div class="flash-card-label">${virado ? 'Resposta' : 'Pergunta'}</div>
      <div class="flash-card-texto">${virado ? card.verso : card.frente}</div>
      ${!virado ? '<div class="flash-card-dica">toque para revelar</div>' : ''}
    </div>
    <div class="flash-acoes">
      ${virado ? `
        <button class="flash-btn flash-btn-nao" onclick="avaliarCard(false)">✗ Não sabia</button>
        <button class="flash-btn flash-btn-sim" onclick="avaliarCard(true)">✓ Sabia!</button>
      ` : `
        <button class="flash-btn flash-btn-ver" onclick="virarCard()">Ver resposta</button>
      `}
    </div>
  `
}

function virarCard() {
  const area = document.getElementById('flash-sessao-area')
  if (!area) return
  const turma = estado.turmaAtual
  const todos = [...(turma.flashcards || []), ...flashcardsDoAluno(turma.id)]
  const index = parseInt(area.dataset.index || '0')
  const acertos = parseInt(area.dataset.acertos || '0')
  area.innerHTML = renderCardHTML(todos, index, acertos, true)
  area.dataset.index = index
  area.dataset.acertos = acertos
}

function avaliarCard(acertou) {
  const area = document.getElementById('flash-sessao-area')
  if (!area) return
  const turma = estado.turmaAtual
  const todos = [...(turma.flashcards || []), ...flashcardsDoAluno(turma.id)]
  const index = parseInt(area.dataset.index || '0')
  const acertos = parseInt(area.dataset.acertos || '0') + (acertou ? 1 : 0)
  const proximo = index + 1

  if (proximo >= todos.length) {
    area.innerHTML = renderFlashResumoHTML(acertos, todos.length)
    return
  }

  area.innerHTML = renderCardHTML(todos, proximo, acertos, false)
  area.dataset.index = proximo
  area.dataset.acertos = acertos
}
```

- [ ] **Passo 4: Adicionar `renderFlashResumoHTML()` em `app.js`**

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
      <button class="flash-resumo-btn" onclick="renderFlashSessao(estado.turmaAtual)">Reiniciar sessão</button>
    </div>
  `
}
```

- [ ] **Passo 5: Corrigir `renderFlashSessao` para inicializar `data-index` e `data-acertos`**

A `div#flash-sessao-area` precisa dos data attributes desde o início. Substitua o trecho de `renderFlashSessao` que gera o HTML:

```js
function renderFlashSessao(turma) {
  const area = document.getElementById('tab-area-flash')
  if (!area) return

  const cardsProf = turma.flashcards || []
  const cardsAluno = flashcardsDoAluno(turma.id)
  const todos = [...cardsProf, ...cardsAluno]

  if (todos.length === 0) {
    area.innerHTML = `
      <div class="flash-sessao" style="text-align:center;padding:32px 16px">
        <div style="font-size:36px;margin-bottom:12px">🃏</div>
        <p style="color:var(--text2);font-size:14px">Nenhum flashcard ainda nesta turma.</p>
      </div>
      ${renderMeuDeckHTML(turma)}
    `
    return
  }

  area.innerHTML = `
    <div class="flash-sessao">
      <div id="flash-sessao-area" data-index="0" data-acertos="0">
        ${renderCardHTML(todos, 0, 0, false)}
      </div>
    </div>
    ${renderMeuDeckHTML(turma)}
  `
}
```

- [ ] **Passo 6: Verificar sessão no browser**

Entre em Penal IV → aba Flashcards. Deve aparecer o primeiro card do professor. Clique para revelar — mostra a resposta e os botões "Sabia/Não sabia". Clique em "Sabia" — avança para o próximo card. Após o último card, deve aparecer a tela de resumo com emoji e botão de reiniciar.

- [ ] **Passo 7: Commit**

```bash
git add app.js
git commit -m "feat(flash): sessão de flashcard com flip, avaliação e resumo"
```

---

### Task 8: Meu Deck — CRUD via localStorage

**Files:**
- Modify: `app.js`

- [ ] **Passo 1: Adicionar funções de localStorage para Meu Deck**

Adicione antes de `renderFlashSessao`:

```js
// ── Meu Deck (localStorage) ──────────────────────────────

function flashcardsDoAluno(turmaId) {
  return JSON.parse(localStorage.getItem(`flashcards_${turmaId}`) || '[]')
}

function salvarFlashcard(turmaId, frente, verso) {
  const cards = flashcardsDoAluno(turmaId)
  cards.push({ id: Date.now().toString(), frente: frente.trim(), verso: verso.trim() })
  localStorage.setItem(`flashcards_${turmaId}`, JSON.stringify(cards))
}

function deletarFlashcard(turmaId, id) {
  const cards = flashcardsDoAluno(turmaId).filter(c => c.id !== id)
  localStorage.setItem(`flashcards_${turmaId}`, JSON.stringify(cards))
}
```

- [ ] **Passo 2: Adicionar `renderMeuDeckHTML()` em `app.js`**

```js
function renderMeuDeckHTML(turma) {
  const cards = flashcardsDoAluno(turma.id)

  const listaHTML = cards.length > 0
    ? cards.map(c => `
        <div class="flash-card-usuario">
          <div class="flash-card-usuario-corpo">
            <div class="flash-card-usuario-frente">${c.frente}</div>
            <div class="flash-card-usuario-verso">${c.verso}</div>
          </div>
          <button class="flash-btn-deletar" onclick="deletarEAtualizar('${turma.id}', '${c.id}')" title="Remover card">✕</button>
        </div>
      `).join('')
    : '<p style="font-size:13px;color:var(--text2);margin-bottom:12px">Você ainda não criou nenhum card.</p>'

  return `
    <div class="meu-deck-secao">
      <div class="meu-deck-titulo">Meu Deck</div>
      <div id="meu-deck-lista">${listaHTML}</div>
      <div class="flash-form" id="flash-form">
        <div class="flash-form-titulo">+ Adicionar card</div>
        <textarea class="flash-input" id="flash-novo-frente" placeholder="Pergunta / frente do card" rows="2"></textarea>
        <textarea class="flash-input" id="flash-novo-verso" placeholder="Resposta / verso do card" rows="2"></textarea>
        <div class="flash-form-acoes">
          <button class="flash-btn-cancelar" onclick="limparFormFlash()">Limpar</button>
          <button class="flash-btn-salvar" onclick="adicionarFlashcard('${turma.id}')">Salvar card</button>
        </div>
      </div>
    </div>
  `
}
```

- [ ] **Passo 3: Adicionar `adicionarFlashcard()`, `deletarEAtualizar()` e `limparFormFlash()` em `app.js`**

```js
function adicionarFlashcard(turmaId) {
  const frente = document.getElementById('flash-novo-frente')?.value || ''
  const verso  = document.getElementById('flash-novo-verso')?.value || ''
  if (!frente.trim() || !verso.trim()) {
    alert('Preencha a pergunta e a resposta antes de salvar.')
    return
  }
  salvarFlashcard(turmaId, frente, verso)
  renderFlashSessao(estado.turmaAtual)
}

function deletarEAtualizar(turmaId, id) {
  if (!confirm('Remover este card?')) return
  deletarFlashcard(turmaId, id)
  renderFlashSessao(estado.turmaAtual)
}

function limparFormFlash() {
  const f = document.getElementById('flash-novo-frente')
  const v = document.getElementById('flash-novo-verso')
  if (f) f.value = ''
  if (v) v.value = ''
}
```

- [ ] **Passo 4: Verificar CRUD no browser**

Na aba Flashcards de Penal IV:
1. Preencha a pergunta e a resposta no formulário → clique "Salvar card"
2. O card deve aparecer na lista "Meu Deck" abaixo do formulário
3. Recarregue a página — o card deve persistir (localStorage)
4. Clique ✕ → confirme — o card deve desaparecer
5. Complete uma sessão com cards do professor + card criado — o resumo deve contar todos

- [ ] **Passo 5: Verificar no mobile (390px)**

O formulário de adicionar card deve ser usável com o teclado mobile. As textareas devem ter tamanho suficiente para digitar confortavelmente.

- [ ] **Passo 6: Commit final**

```bash
git add app.js
git commit -m "feat(flash): Meu Deck com CRUD via localStorage"
```

---

## Checklist de conclusão

- [ ] Visual moderno aplicado em todo o site — sem dourado como acento primário
- [ ] Tela inicial em cards, sem scroll horizontal em mobile
- [ ] Header responsivo em 390px
- [ ] Cards de turma e tema navegáveis por toque
- [ ] Turmas com flashcards mostram abas "Conteúdo" e "Flashcards"
- [ ] Sessão de flashcard: flip, avaliação, progresso, resumo
- [ ] Meu Deck: criar, listar e deletar cards via localStorage
- [ ] Dados persistem após recarregar a página
- [ ] Sem regressões nas telas existentes (breadcrumb, histórico, sobre mim)
