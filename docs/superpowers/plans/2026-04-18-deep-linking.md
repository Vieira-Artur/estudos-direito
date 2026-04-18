# Deep Linking com Hash — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer com que URLs do tipo `/tributario/tributario-financeiro-i/01-guia-estudos#reparticao-de-receitas` abram o tema correto e rolem até a seção, funcionando também em cola direta no browser e em F5.

**Architecture:** URL real derivada de `tema.arquivo` (remove `conteudo/` e `.html`); boot-routing lê `pathname` e navega para a view correta sem tocar em `data.js`; `rolarParaAncora()` lê `window.location.hash` após o tema carregar e ativa a aba se necessário antes de rolar. GitHub Pages recebe `404.html` idêntico ao `index.html` para servir o SPA em qualquer rota desconhecida.

**Tech Stack:** Vanilla JS (ES2020), History API, GitHub Pages static hosting.

---

## Estrutura de arquivos

| Arquivo | Ação |
|---------|------|
| `404.html` | Criar — cópia de `index.html` |
| `app.js` | Modificar — boot-routing, `pushState` com URL, `rolarParaAncora`, `ativarTabDoElemento` |
| `conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html` | Modificar — adicionar `id` nas seções |
| `conteudo/tributario/processo-tributario/01-fazenda-publica.html` | Modificar — idem |
| `conteudo/tributario/processo-tributario/02-lancamento.html` | Modificar — idem |
| `conteudo/tributario/processo-tributario/03-execucao-fiscal.html` | Modificar — idem |
| `conteudo/processual-penal-ii/01-teoria-geral-provas.html` | Modificar — idem |
| `conteudo/processual-penal-ii/02-provas-em-especie.html` | Modificar — idem |
| `conteudo/processual-penal-ii/03-prisoes.html` | Modificar — idem |
| `conteudo/penal/penal-iv/01-fe-publica.html` | Modificar — idem |
| `conteudo/penal/penal-iv/02-adm-publica.html` | Modificar — idem |
| `conteudo/penal/penal-iv/03-sentimento-religioso.html` | Modificar — idem |
| `conteudo/processual-penal-iii/01-procedimentos.html` | Modificar — idem |

**Nota sobre tab panels:** Todos os arquivos HTML de conteúdo usam tab panels que **já possuem `id`** (ex: `pp3-flagrante`, `tf-visao`, `pp1-ilicita`). Esses IDs já funcionam como âncoras de granularidade grossa. As tarefas de HTML abaixo adicionam IDs de granularidade fina nas `section-title` divs **dentro** dos tab panels.

---

## Task 1: Criar `404.html`

**Files:**
- Create: `404.html` (cópia de `index.html`)

- [ ] **Step 1: Copiar `index.html` para `404.html`**

```bash
cp /c/Users/artur/Documents/estudos-direito/index.html \
   /c/Users/artur/Documents/estudos-direito/404.html
```

- [ ] **Step 2: Verificar que os dois arquivos são idênticos**

```bash
diff index.html 404.html
```

Esperado: sem saída (arquivos idênticos).

- [ ] **Step 3: Commit**

```bash
git add 404.html
git commit -m "feat: adiciona 404.html para suporte a deep links no GitHub Pages"
```

---

## Task 2: Adicionar `ativarTabDoElemento` e `rolarParaAncora` ao `app.js`

**Files:**
- Modify: `app.js`

Estas duas funções são chamadas por tasks posteriores. Adicioná-las **antes** de alterar o fluxo de navegação permite testar o scroll em isolamento.

- [ ] **Step 1: Localizar o fim da função `executarScripts` em `app.js` (linha ≈ 466)**

```bash
grep -n "function executarScripts" app.js
```

- [ ] **Step 2: Inserir `ativarTabDoElemento` e `rolarParaAncora` logo após `executarScripts`**

Adicionar após o fechamento de `executarScripts` (o `}` isolado):

```js
function ativarTabDoElemento(el) {
  const isPainel = n => n.id && (n.className.includes('-painel') || n.className.includes('tab-content'))
  const isAtivo  = n => n.classList.contains('ativo') || n.classList.contains('active')
  let panel = isPainel(el) ? el : null
  if (!panel) {
    let node = el.parentElement
    while (node && node !== document.body) {
      if (isPainel(node)) { panel = node; break }
      node = node.parentElement
    }
  }
  if (!panel || isAtivo(panel)) return
  const btn = document.querySelector(`[onclick*="${panel.id}"]`)
  if (btn) btn.click()
}

function rolarParaAncora() {
  const hash = window.location.hash
  if (!hash) return
  const alvo = document.getElementById(hash.slice(1))
  if (!alvo) return
  ativarTabDoElemento(alvo)
  const reduzirMov = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  requestAnimationFrame(() =>
    alvo.scrollIntoView({ behavior: reduzirMov ? 'auto' : 'smooth', block: 'start' })
  )
}
```

- [ ] **Step 3: Localizar onde `executarScripts(area)` é chamado dentro de `abrirTema` (linha ≈ 539)**

```bash
grep -n "executarScripts(area)" app.js
```

- [ ] **Step 4: Adicionar chamada a `rolarParaAncora()` logo após `executarScripts(area)`**

Trocar:
```js
      executarScripts(area)
    })
    .catch(() => {
```

Por:
```js
      executarScripts(area)
      rolarParaAncora()
    })
    .catch(() => {
```

- [ ] **Step 5: Verificar no browser que o scroll funciona manualmente**

Abrir o site localmente, navegar até um tema com abas (ex: Prisões), abrir DevTools Console e rodar:

```js
window.location.hash = '#pp3-flagrante'
rolarParaAncora()
```

Esperado: aba "Flagrante" ativa e scroll até ela, sem erros no console.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat(app): adiciona rolarParaAncora e ativarTabDoElemento"
```

---

## Task 3: Adicionar URL real nas chamadas de `pushState`

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Atualizar `replaceState` inicial (linha ≈ 65)**

Trocar:
```js
history.replaceState({ view: 'materias' }, '')
```

Por:
```js
history.replaceState({ view: 'materias' }, '', '/')
```

- [ ] **Step 2: Atualizar `pushState` em `renderArvore` (linha ≈ 95)**

Trocar:
```js
  if (!fromPop) history.pushState({ view: 'materias' }, '')
```

Por:
```js
  if (!fromPop) history.pushState({ view: 'materias' }, '', '/')
```

- [ ] **Step 3: Atualizar `pushState` em `selecionarMateria` (linha ≈ 129)**

Trocar:
```js
  if (!fromPop) history.pushState({ view: 'materia', materiaId: id }, '')
```

Por:
```js
  if (!fromPop) history.pushState({ view: 'materia', materiaId: id }, '', `/${id}`)
```

- [ ] **Step 4: Atualizar `pushState` em `selecionarTurma` (linha ≈ 159)**

Trocar:
```js
  if (!fromPop) history.pushState({ view: 'turma', materiaId, turmaId }, '')
```

Por:
```js
  if (!fromPop) history.pushState({ view: 'turma', materiaId, turmaId }, '', `/${materiaId}/${turmaId}`)
```

- [ ] **Step 5: Atualizar `pushState` em `abrirTema` (linha ≈ 482)**

Trocar:
```js
  if (!fromPop) history.pushState({
    view: 'tema',
    materiaId: estado.materiaAtual.id,
    turmaId: estado.turmaAtual.id,
    temaIndex: index
  }, '')
```

Por:
```js
  const _temaSlug = tema.arquivo.replace('conteudo/', '').replace('.html', '')
  if (!fromPop) history.pushState({
    view: 'tema',
    materiaId: estado.materiaAtual.id,
    turmaId: estado.turmaAtual.id,
    temaIndex: index
  }, '', `/${_temaSlug}`)
```

- [ ] **Step 6: Atualizar `pushState` em `abrirSobre` (linha ≈ 588)**

Trocar:
```js
  if (!fromPop) history.pushState({ view: 'sobre' }, '')
```

Por:
```js
  if (!fromPop) history.pushState({ view: 'sobre' }, '', '/sobre')
```

- [ ] **Step 7: Verificar navegação no browser**

Abrir o site, navegar entre matérias/turmas/temas e confirmar que a barra de endereços muda (ex: `/tributario`, `/tributario/tributario-financeiro-i`, `/tributario/tributario-financeiro-i/01-guia-estudos`). Botão Voltar do browser deve funcionar.

- [ ] **Step 8: Commit**

```bash
git add app.js
git commit -m "feat(app): adiciona URL real nas chamadas de pushState"
```

---

## Task 4: Adicionar `inicializarRota` e substituir boot sequence

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Localizar as linhas de inicialização no topo de `app.js` (linhas ≈ 64–66)**

```bash
grep -n "replaceState\|renderArvore(true)" app.js | head -5
```

- [ ] **Step 2: Inserir a função `inicializarRota` antes das linhas de inicialização**

Adicionar esta função antes do bloco de inicialização:

```js
function inicializarRota() {
  const path = window.location.pathname.replace(/\/$/, '') || '/'

  if (path === '/' || path === '') {
    history.replaceState({ view: 'materias' }, '', '/')
    renderArvore(true)
    return
  }

  if (path === '/sobre') {
    abrirSobre(true)
    return
  }

  for (const materia of materias) {
    if (path === `/${materia.id}`) {
      history.replaceState({ view: 'materia', materiaId: materia.id }, '', path)
      selecionarMateria(materia.id, true)
      return
    }
    for (const turma of materia.turmas) {
      if (path === `/${materia.id}/${turma.id}`) {
        estado.materiaAtual = materia
        estado.turmaAtual   = turma
        history.replaceState({ view: 'turma', materiaId: materia.id, turmaId: turma.id }, '', path)
        selecionarTurma(materia.id, turma.id, true)
        return
      }
      for (let i = 0; i < turma.temas.length; i++) {
        const tema = turma.temas[i]
        const slug = tema.arquivo.replace('conteudo/', '').replace('.html', '')
        if (path === `/${slug}`) {
          estado.materiaAtual = materia
          estado.turmaAtual   = turma
          history.replaceState({
            view: 'tema',
            materiaId: materia.id,
            turmaId: turma.id,
            temaIndex: i
          }, '', path)
          abrirTema(i, true)
          return
        }
      }
    }
  }

  // Fallback: rota não reconhecida → home
  history.replaceState({ view: 'materias' }, '', '/')
  renderArvore(true)
}
```

- [ ] **Step 3: Substituir o bloco de inicialização original**

Trocar:
```js
history.replaceState({ view: 'materias' }, '')
renderArvore(true)
```

Por:
```js
inicializarRota()
```

- [ ] **Step 4: Verificar boot-routing**

Abrir diretamente no browser a URL de um tema (ex: `http://localhost:PORT/tributario/tributario-financeiro-i/01-guia-estudos`). Deve abrir o tema "Fundamentos e Crédito Tributário" sem erro no console.

- [ ] **Step 5: Verificar deep link com hash**

Abrir `http://localhost:PORT/tributario/tributario-financeiro-i/01-guia-estudos#reparticao-de-receitas`. Deve abrir o tema e — após os IDs serem adicionados na Task 6 — rolar até "Repartição de Receitas". Por agora verificar que não há erro e que o tema carrega.

- [ ] **Step 6: Commit**

```bash
git add app.js
git commit -m "feat(app): adiciona inicializarRota para boot-routing por URL"
```

---

## Task 5: Atualizar handler `popstate` para chamar `rolarParaAncora`

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Localizar o handler `popstate` (linha ≈ 69)**

```bash
grep -n "popstate" app.js
```

- [ ] **Step 2: Adicionar chamada a `rolarParaAncora()` no bloco `view === 'tema'`**

Trocar:
```js
  } else if (s.view === 'tema') {
    const materia = materias.find(m => m.id === s.materiaId)
    const turma   = materia.turmas.find(t => t.id === s.turmaId)
    estado.materiaAtual = materia
    estado.turmaAtual   = turma
    abrirTema(s.temaIndex, true)
  }
```

Por:
```js
  } else if (s.view === 'tema') {
    const materia = materias.find(m => m.id === s.materiaId)
    const turma   = materia.turmas.find(t => t.id === s.turmaId)
    estado.materiaAtual = materia
    estado.turmaAtual   = turma
    abrirTema(s.temaIndex, true)
    // rolarParaAncora() é chamada dentro de abrirTema após o fetch;
    // mas o hash pode ter mudado via popstate, então chama novamente após o fetch terminar.
    // A chamada dentro de abrirTema já cobre este caso.
  }
```

**Nota:** `rolarParaAncora()` já é chamada dentro de `abrirTema` após o `innerHTML` (Task 2). O `popstate` de tema já está coberto. Este step confirma que não é necessária chamada adicional — `abrirTema` cuida disso.

- [ ] **Step 3: Verificar com Alt+← no browser**

Navegar: Home → Tributário → Tributário Financeiro I → Fundamentos (com hash `#reparticao-de-receitas`). Depois pressionar Alt+← (voltar). Avançar (Alt+→) de volta para o tema. Deve rolar até a âncora novamente.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat(app): suporta deep link com hash para ancorar seção do tema"
```

---

## Task 6: IDs em `tributario/tributario-financeiro-i/01-guia-estudos.html`

**Files:**
- Modify: `conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html`

Tab panels existentes (não alterar): `tf-visao` (ativo), `tf-mapa`, `tf-roteiro`, `tf-caso`.

Adicionar `id` a cada `<div class="tf-section-title">` — o `id` vai no próprio div.

- [ ] **Step 1: Adicionar IDs nas seções da aba `tf-visao` (linhas ≈ 198–263)**

Aplicar as seguintes trocas (uma por vez, usando Edit ou busca-e-substitui):

```
ANTES:  <div class="tf-section-title">Espécies Tributárias (teoria pentapartida)</div>
DEPOIS: <div id="especies-tributarias" class="tf-section-title">Espécies Tributárias (teoria pentapartida)</div>

ANTES:  <div class="tf-section-title">Ciclo do Crédito Tributário</div>
DEPOIS: <div id="ciclo-credito" class="tf-section-title">Ciclo do Crédito Tributário</div>

ANTES:  <div class="tf-section-title">Modificação do Crédito (Suspensão · Extinção · Exclusão)</div>
DEPOIS: <div id="modificacao-credito" class="tf-section-title">Modificação do Crédito (Suspensão · Extinção · Exclusão)</div>

ANTES:  <div class="tf-section-title">Princípios Constitucionais e Exceções</div>
DEPOIS: <div id="principios" class="tf-section-title">Princípios Constitucionais e Exceções</div>

ANTES:  <div class="tf-section-title">Repartição de Receitas — síntese</div>
DEPOIS: <div id="reparticao-de-receitas" class="tf-section-title">Repartição de Receitas — síntese</div>
```

- [ ] **Step 2: Adicionar IDs nas seções da aba `tf-roteiro` (linhas ≈ 366–407)**

```
ANTES:  <div class="tf-section-title">Unidade 1 — Direito Financeiro vs. Direito Tributário</div>
DEPOIS: <div id="unidade-1" class="tf-section-title">Unidade 1 — Direito Financeiro vs. Direito Tributário</div>

ANTES:  <div class="tf-section-title">Unidade 2 — Espécies Tributárias</div>
DEPOIS: <div id="unidade-2" class="tf-section-title">Unidade 2 — Espécies Tributárias</div>

ANTES:  <div class="tf-section-title">Unidade 3 — Extrafiscalidade</div>
DEPOIS: <div id="unidade-3" class="tf-section-title">Unidade 3 — Extrafiscalidade</div>

ANTES:  <div class="tf-section-title">Unidade 4 — Crédito Tributário: constituição e legalidade</div>
DEPOIS: <div id="unidade-4" class="tf-section-title">Unidade 4 — Crédito Tributário: constituição e legalidade</div>

ANTES:  <div class="tf-section-title">Unidade 5 — Suspensão, Extinção e Exclusão</div>
DEPOIS: <div id="unidade-5" class="tf-section-title">Unidade 5 — Suspensão, Extinção e Exclusão</div>

ANTES:  <div class="tf-section-title">Unidade 6 — Limitações Constitucionais ao Poder de Tributar</div>
DEPOIS: <div id="unidade-6" class="tf-section-title">Unidade 6 — Limitações Constitucionais ao Poder de Tributar</div>

ANTES:  <div class="tf-section-title">Unidade 7 — Competência e Repartição de Receitas</div>
DEPOIS: <div id="unidade-7" class="tf-section-title">Unidade 7 — Competência e Repartição de Receitas</div>
```

- [ ] **Step 3: Verificar que não há `id` duplicado no arquivo**

```bash
grep -o 'id="[^"]*"' conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html | sort | uniq -d
```

Esperado: sem saída (nenhum duplicado).

- [ ] **Step 4: Testar deep link da seção principal**

No browser: `http://localhost:PORT/tributario/tributario-financeiro-i/01-guia-estudos#reparticao-de-receitas`

Esperado: tema abre, scroll vai até "Repartição de Receitas — síntese".

- [ ] **Step 5: Commit**

```bash
git add conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html
git commit -m "feat(conteudo): adiciona ids em tributario-financeiro-i/01-guia-estudos"
```

---

## Task 7: IDs em `tributario/processo-tributario/01-fazenda-publica.html`

**Files:**
- Modify: `conteudo/tributario/processo-tributario/01-fazenda-publica.html`

Tab panels existentes: `pt-visao` (ativo), `pt-infog`, `pt-roteiro`, `pt-caso`.

- [ ] **Step 1: Adicionar IDs nas seções da aba `pt-visao` (linhas ≈ 195–384)**

```
ANTES:  <div class="pt-section-title">O que é a Fazenda Pública?</div>
DEPOIS: <div id="fazenda-conceito" class="pt-section-title">O que é a Fazenda Pública?</div>

ANTES:  <div class="pt-section-title">Prerrogativas Processuais (CPC/15)</div>
DEPOIS: <div id="prerrogativas" class="pt-section-title">Prerrogativas Processuais (CPC/15)</div>

ANTES:  <div class="pt-section-title">Honorários — Escalonamento Obrigatório (Art. 85 §3º CPC)</div>
DEPOIS: <div id="honorarios" class="pt-section-title">Honorários — Escalonamento Obrigatório (Art. 85 §3º CPC)</div>

ANTES:  <div class="pt-section-title">Regime de Pagamentos: Precatórios e RPV</div>
DEPOIS: <div id="precatorios-rpv" class="pt-section-title">Regime de Pagamentos: Precatórios e RPV</div>

ANTES:  <div class="pt-section-title">Limitações Tutelares e Suspensão de Segurança</div>
DEPOIS: <div id="limitacoes-tutelares" class="pt-section-title">Limitações Tutelares e Suspensão de Segurança</div>

ANTES:  <div class="pt-section-title">Roteiro de Estudo — 5 Passos</div>
DEPOIS: <div id="roteiro-fazenda" class="pt-section-title">Roteiro de Estudo — 5 Passos</div>

ANTES:  <div class="pt-section-title">Mapa Legislativo Essencial</div>
DEPOIS: <div id="mapa-legislativo" class="pt-section-title">Mapa Legislativo Essencial</div>
```

- [ ] **Step 2: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/tributario/processo-tributario/01-fazenda-publica.html | sort | uniq -d
```

Esperado: sem saída.

- [ ] **Step 3: Commit**

```bash
git add conteudo/tributario/processo-tributario/01-fazenda-publica.html
git commit -m "feat(conteudo): adiciona ids em processo-tributario/01-fazenda-publica"
```

---

## Task 8: IDs em `tributario/processo-tributario/02-lancamento.html`

**Files:**
- Modify: `conteudo/tributario/processo-tributario/02-lancamento.html`

Tab panels existentes: `pt2-visao` (ativo), `pt2-infog`, `pt2-roteiro`, `pt2-caso`.

- [ ] **Step 1: Adicionar IDs nas seções da aba `pt2-visao` (linhas ≈ 188–344)**

```
ANTES:  <div class="pt-section-title">O Ato de Lançamento (Art. 142 CTN)</div>
DEPOIS: <div id="lancamento-conceito" class="pt-section-title">O Ato de Lançamento (Art. 142 CTN)</div>

ANTES:  <div class="pt-section-title">As 5 Funções do Lançamento</div>
DEPOIS: <div id="funcoes-lancamento" class="pt-section-title">As 5 Funções do Lançamento</div>

ANTES:  <div class="pt-section-title">Modalidades de Lançamento</div>
DEPOIS: <div id="modalidades-lancamento" class="pt-section-title">Modalidades de Lançamento</div>

ANTES:  <div class="pt-section-title">A Regra do Tempo e Vigência (Art. 143/144 CTN)</div>
DEPOIS: <div id="regra-tempo" class="pt-section-title">A Regra do Tempo e Vigência (Art. 143/144 CTN)</div>

ANTES:  <div class="pt-section-title">Revisão e Alteração do Lançamento (Arts. 145–146 CTN)</div>
DEPOIS: <div id="revisao-lancamento" class="pt-section-title">Revisão e Alteração do Lançamento (Arts. 145–146 CTN)</div>

ANTES:  <div class="pt-section-title">Roteiro de Estudo — 4 Passos</div>
DEPOIS: <div id="roteiro-lancamento" class="pt-section-title">Roteiro de Estudo — 4 Passos</div>

ANTES:  <div class="pt-section-title">Quadro Comparativo das Modalidades</div>
DEPOIS: <div id="quadro-modalidades" class="pt-section-title">Quadro Comparativo das Modalidades</div>
```

- [ ] **Step 2: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/tributario/processo-tributario/02-lancamento.html | sort | uniq -d
```

- [ ] **Step 3: Commit**

```bash
git add conteudo/tributario/processo-tributario/02-lancamento.html
git commit -m "feat(conteudo): adiciona ids em processo-tributario/02-lancamento"
```

---

## Task 9: IDs em `tributario/processo-tributario/03-execucao-fiscal.html`

**Files:**
- Modify: `conteudo/tributario/processo-tributario/03-execucao-fiscal.html`

Tab panels existentes: `pt3-visao` (ativo), `pt3-infog`, `pt3-roteiro`, `pt3-caso`.

- [ ] **Step 1: Adicionar IDs nas seções da aba `pt3-visao` (linhas ≈ 209–405)**

```
ANTES:  <div class="pt-section-title">O que é a Execução Fiscal?</div>
DEPOIS: <div id="execucao-conceito" class="pt-section-title">O que é a Execução Fiscal?</div>

ANTES:  <div class="pt-section-title">As 4 Fases da Execução Fiscal</div>
DEPOIS: <div id="fases-execucao" class="pt-section-title">As 4 Fases da Execução Fiscal</div>

ANTES:  <div class="pt-section-title">Prescrição e Decadência na Execução Fiscal</div>
DEPOIS: <div id="prescricao-decadencia-lef" class="pt-section-title">Prescrição e Decadência na Execução Fiscal</div>

ANTES:  <div class="pt-section-title">Roteiro de Estudo — 5 Passos</div>
DEPOIS: <div id="roteiro-lef" class="pt-section-title">Roteiro de Estudo — 5 Passos</div>

ANTES:  <div class="pt-section-title">Mapa Legislativo Essencial</div>
DEPOIS: <div id="mapa-lef" class="pt-section-title">Mapa Legislativo Essencial</div>
```

- [ ] **Step 2: Adicionar IDs nos `h3` dentro das 4 Fases (sub-seções)**

Dentro da seção `fases-execucao`, há `h3` que identificam sub-fases:

```
ANTES:  <h3>Do Nascimento ao Título — Linha do Tempo</h3>
DEPOIS: <h3 id="linha-do-tempo">Do Nascimento ao Título — Linha do Tempo</h3>

ANTES:  <h3>O Processo Judicial de Execução</h3>
DEPOIS: <h3 id="processo-judicial">O Processo Judicial de Execução</h3>

ANTES:  <h3>Defesas do Devedor</h3>
DEPOIS: <h3 id="defesas">Defesas do Devedor</h3>

ANTES:  <h3>Atos de Expropriação — Satisfação do Crédito</h3>
DEPOIS: <h3 id="expropriacao">Atos de Expropriação — Satisfação do Crédito</h3>
```

- [ ] **Step 3: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/tributario/processo-tributario/03-execucao-fiscal.html | sort | uniq -d
```

- [ ] **Step 4: Commit**

```bash
git add conteudo/tributario/processo-tributario/03-execucao-fiscal.html
git commit -m "feat(conteudo): adiciona ids em processo-tributario/03-execucao-fiscal"
```

---

## Task 10: IDs em `processual-penal-ii/01-teoria-geral-provas.html`

**Files:**
- Modify: `conteudo/processual-penal-ii/01-teoria-geral-provas.html`

Tab panels existentes: `pp1-mapa` (ativo), `pp1-conceitos`, `pp1-ilicita`, `pp1-sistemas`, `pp1-tabela`, `pp1-roteiro`, `pp1-casos`. Esses já são âncoras de granularidade grossa. Adicionar IDs de granularidade fina nas `section-title` divs dentro de cada panel.

- [ ] **Step 1: Adicionar IDs nas seções dentro de `pp1-mapa` (linha ≈ 242)**

```
ANTES:  <div class="section-title">Mapa Mental — Teoria Geral das Provas</div>
DEPOIS: <div id="mapa-mental-provas" class="section-title">Mapa Mental — Teoria Geral das Provas</div>
```

- [ ] **Step 2: Adicionar IDs nas seções dentro de `pp1-conceitos` (linhas ≈ 332–538)**

```
ANTES:  <div class="section-title">Distinção: Prova × Elementos Informativos</div>
DEPOIS: <div id="prova-vs-elementos" class="section-title">Distinção: Prova × Elementos Informativos</div>

ANTES:  <div class="section-title">Provas Cautelares, Não Repetíveis e Antecipadas</div>
DEPOIS: <div id="provas-cautelares" class="section-title">Provas Cautelares, Não Repetíveis e Antecipadas</div>

ANTES:  <div class="section-title">Ônus da Prova</div>
DEPOIS: <div id="onus-prova" class="section-title">Ônus da Prova</div>

ANTES:  <div class="section-title">Prova Emprestada</div>
DEPOIS: <div id="prova-emprestada" class="section-title">Prova Emprestada</div>

ANTES:  <div class="section-title">Encontro Fortuito de Provas (Serendipidade)</div>
DEPOIS: <div id="serendipidade" class="section-title">Encontro Fortuito de Provas (Serendipidade)</div>
```

- [ ] **Step 3: Adicionar IDs nas seções dentro de `pp1-ilicita` (linhas ≈ 440–513)**

```
ANTES:  <div class="section-title">Prova Ilícita × Prova Ilegítima</div>
DEPOIS: <div id="prova-ilicita" class="section-title">Prova Ilícita × Prova Ilegítima</div>

ANTES:  <div class="section-title">Teoria dos Frutos da Árvore Envenenada</div>
DEPOIS: <div id="arvore-envenenada" class="section-title">Teoria dos Frutos da Árvore Envenenada</div>

ANTES:  <div class="section-title">Limitações à Contaminação (Exceptions)</div>
DEPOIS: <div id="limitacoes-contaminacao" class="section-title">Limitações à Contaminação (Exceptions)</div>

ANTES:  <div class="section-title">Cadeia de Custódia</div>
DEPOIS: <div id="cadeia-custodia" class="section-title">Cadeia de Custódia</div>
```

- [ ] **Step 4: Adicionar IDs nas seções dentro de `pp1-sistemas` (linhas ≈ 538–631)**

```
ANTES:  <div class="section-title">Sistemas de Avaliação da Prova</div>
DEPOIS: <div id="sistemas-avaliacao" class="section-title">Sistemas de Avaliação da Prova</div>

ANTES:  <div class="section-title">Iniciativa Probatória do Juiz (Art. 156 CPP)</div>
DEPOIS: <div id="iniciativa-probatoria" class="section-title">Iniciativa Probatória do Juiz (Art. 156 CPP)</div>

ANTES:  <div class="section-title">Standards Probatórios (Critérios de Decisão)</div>
DEPOIS: <div id="standards-probatorios" class="section-title">Standards Probatórios (Critérios de Decisão)</div>
```

- [ ] **Step 5: Adicionar IDs nas seções dentro de `pp1-tabela` (linhas ≈ 632–703)**

```
ANTES:  <div class="section-title">Prova × Elemento Informativo — Diferenças</div>
DEPOIS: <div id="prova-elemento-diferencas" class="section-title">Prova × Elemento Informativo — Diferenças</div>

ANTES:  <div class="section-title">Limitações à Prova Ilícita por Derivação</div>
DEPOIS: <div id="limitacoes-derivacao" class="section-title">Limitações à Prova Ilícita por Derivação</div>

ANTES:  <div class="section-title">Tipos de Testemunha — Tabela Comparativa</div>
DEPOIS: <div id="tipos-testemunha" class="section-title">Tipos de Testemunha — Tabela Comparativa</div>
```

- [ ] **Step 6: Adicionar IDs nas seções dentro de `pp1-roteiro` e `pp1-casos`**

```
ANTES:  <div class="section-title">Roteiro de Estudo — Teoria Geral das Provas</div>
DEPOIS: <div id="roteiro-teoria-provas" class="section-title">Roteiro de Estudo — Teoria Geral das Provas</div>

ANTES:  <div class="section-title">Jurisprudência Estruturante</div>
DEPOIS: <div id="jurisprudencia-provas" class="section-title">Jurisprudência Estruturante</div>

ANTES:  <div class="section-title">Casos Práticos — Teoria Geral das Provas</div>
DEPOIS: <div id="casos-praticos-provas" class="section-title">Casos Práticos — Teoria Geral das Provas</div>
```

- [ ] **Step 7: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/processual-penal-ii/01-teoria-geral-provas.html | sort | uniq -d
```

- [ ] **Step 8: Commit**

```bash
git add conteudo/processual-penal-ii/01-teoria-geral-provas.html
git commit -m "feat(conteudo): adiciona ids em processual-penal-ii/01-teoria-geral-provas"
```

---

## Task 11: IDs em `processual-penal-ii/02-provas-em-especie.html`

**Files:**
- Modify: `conteudo/processual-penal-ii/02-provas-em-especie.html`

Tab panels existentes: `pp2-mapa` (ativo), `pp2-pericia`, `pp2-testemunha`, `pp2-reconhecimento`, `pp2-outros`, `pp2-tabela`, `pp2-roteiro`, `pp2-casos`.

- [ ] **Step 1: Adicionar ID na section-title da aba `pp2-mapa`**

```
ANTES:  <div class="section-title">Mapa Mental — Provas em Espécie</div>
DEPOIS: <div id="mapa-provas-especie" class="section-title">Mapa Mental — Provas em Espécie</div>
```

- [ ] **Step 2: Adicionar IDs nas seções dentro de `pp2-pericia` (linhas ≈ 220–281)**

```
ANTES:  <div class="section-title">Exame de Corpo de Delito</div>
DEPOIS: <div id="corpo-de-delito" class="section-title">Exame de Corpo de Delito</div>

ANTES:  <div class="section-title">Peritos</div>
DEPOIS: <div id="peritos" class="section-title">Peritos</div>

ANTES:  <div class="section-title">Assistente Técnico</div>
DEPOIS: <div id="assistente-tecnico" class="section-title">Assistente Técnico</div>
```

- [ ] **Step 3: Adicionar IDs nas seções dentro de `pp2-testemunha` (linhas ≈ 283–334)**

```
ANTES:  <div class="section-title">Prova Testemunhal — Características</div>
DEPOIS: <div id="testemunhal" class="section-title">Prova Testemunhal — Características</div>

ANTES:  <div class="section-title">Quem Pode/Não Pode Depor</div>
DEPOIS: <div id="quem-pode-depor" class="section-title">Quem Pode/Não Pode Depor</div>

ANTES:  <div class="section-title">Número de Testemunhas por Procedimento</div>
DEPOIS: <div id="numero-testemunhas" class="section-title">Número de Testemunhas por Procedimento</div>

ANTES:  <div class="section-title">Contradita (Art. 214)</div>
DEPOIS: <div id="contradita" class="section-title">Contradita (Art. 214)</div>
```

- [ ] **Step 4: Adicionar IDs nas seções dentro de `pp2-reconhecimento` (linhas ≈ 336–401)**

```
ANTES:  <div class="section-title">Reconhecimento de Pessoas — Procedimento Obrigatório (Art. 226)</div>
DEPOIS: <div id="reconhecimento-pessoas" class="section-title">Reconhecimento de Pessoas — Procedimento Obrigatório (Art. 226)</div>

ANTES:  <div class="section-title">Reconhecimento Fotográfico</div>
DEPOIS: <div id="reconhecimento-fotografico" class="section-title">Reconhecimento Fotográfico</div>
```

- [ ] **Step 5: Adicionar IDs nas seções dentro de `pp2-outros` (linhas ≈ 370–469)**

```
ANTES:  <div class="section-title">Busca e Apreensão</div>
DEPOIS: <div id="busca-apreensao" class="section-title">Busca e Apreensão</div>

ANTES:  <div class="section-title">Interrogatório — Pontos Críticos</div>
DEPOIS: <div id="interrogatorio" class="section-title">Interrogatório — Pontos Críticos</div>

ANTES:  <div class="section-title">Confissão — Pontos Críticos</div>
DEPOIS: <div id="confissao" class="section-title">Confissão — Pontos Críticos</div>

ANTES:  <div class="section-title">Ofendido (Arts. 201–203)</div>
DEPOIS: <div id="ofendido" class="section-title">Ofendido (Arts. 201–203)</div>

ANTES:  <div class="section-title">Acareação (Arts. 229–230)</div>
DEPOIS: <div id="acareacao" class="section-title">Acareação (Arts. 229–230)</div>
```

- [ ] **Step 6: Adicionar IDs nas seções dentro de `pp2-tabela`, `pp2-roteiro` e `pp2-casos`**

```
ANTES:  <div class="section-title">Quadro Comparativo — Principais Meios de Prova em Espécie</div>
DEPOIS: <div id="quadro-provas" class="section-title">Quadro Comparativo — Principais Meios de Prova em Espécie</div>

ANTES:  <div class="section-title">Reconhecimento — Comparativo: Fotográfico × Pessoal</div>
DEPOIS: <div id="reconhecimento-comparativo" class="section-title">Reconhecimento — Comparativo: Fotográfico × Pessoal</div>

ANTES:  <div class="section-title">Roteiro de Estudo — Provas em Espécie</div>
DEPOIS: <div id="roteiro-provas-especie" class="section-title">Roteiro de Estudo — Provas em Espécie</div>

ANTES:  <div class="section-title">Casos Práticos — Provas em Espécie</div>
DEPOIS: <div id="casos-praticos-provas-especie" class="section-title">Casos Práticos — Provas em Espécie</div>
```

- [ ] **Step 7: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/processual-penal-ii/02-provas-em-especie.html | sort | uniq -d
```

- [ ] **Step 8: Commit**

```bash
git add conteudo/processual-penal-ii/02-provas-em-especie.html
git commit -m "feat(conteudo): adiciona ids em processual-penal-ii/02-provas-em-especie"
```

---

## Task 12: IDs em `processual-penal-ii/03-prisoes.html`

**Files:**
- Modify: `conteudo/processual-penal-ii/03-prisoes.html`

Tab panels existentes (já são âncoras primárias): `pp3-mapa`, `pp3-flagrante`, `pp3-preventiva`, `pp3-temporaria`, `pp3-cautelares`, `pp3-domiciliar`, `pp3-tabela`, `pp3-roteiro`, `pp3-casos`, `pp3-guia`. Adicionar IDs nas `section-title` divs dentro de cada panel.

- [ ] **Step 1: Adicionar IDs nas `section-title` da aba `pp3-mapa` (linha ≈ 153)**

```
ANTES:  <div class="section-title">Mapa Mental — Prisões e Medidas Cautelares</div>
DEPOIS: <div id="mapa-prisoes" class="section-title">Mapa Mental — Prisões e Medidas Cautelares</div>

ANTES:  <div class="section-title" style="margin-top:2rem;">Mapa Mental — Imagem</div>
DEPOIS: <div id="mapa-prisoes-imagem" class="section-title" style="margin-top:2rem;">Mapa Mental — Imagem</div>

ANTES:  <div class="section-title" style="margin-top:2rem;">Infográfico — Prisões Cautelares e Fiança</div>
DEPOIS: <div id="infografico-prisoes" class="section-title" style="margin-top:2rem;">Infográfico — Prisões Cautelares e Fiança</div>
```

- [ ] **Step 2: Adicionar IDs nas `section-title` das abas de prisão (linhas ≈ 234–598)**

```
ANTES:  <div class="section-title">Espécies de Flagrante</div>
DEPOIS: <div id="especies-flagrante" class="section-title">Espécies de Flagrante</div>

ANTES:  <div class="section-title">Sujeito Ativo do Flagrante</div>
DEPOIS: <div id="sujeito-flagrante" class="section-title">Sujeito Ativo do Flagrante</div>

ANTES:  <div class="section-title">Audiência de Custódia (Art. 310)</div>
DEPOIS: <div id="audiencia-custodia" class="section-title">Audiência de Custódia (Art. 310)</div>

ANTES:  <div class="section-title">Novidades — Lei 15.272/2025 (Art. 310, §§5º e 6º)</div>
DEPOIS: <div id="lei-15272" class="section-title">Novidades — Lei 15.272/2025 (Art. 310, §§5º e 6º)</div>

ANTES:  <div class="section-title">Pressupostos da Prisão Preventiva (Art. 312)</div>
DEPOIS: <div id="pressupostos-preventiva" class="section-title">Pressupostos da Prisão Preventiva (Art. 312)</div>

ANTES:  <div class="section-title">Critérios de Periculosidade — Art. 312, §3º (Lei 15.272/2025)</div>
DEPOIS: <div id="periculosidade" class="section-title">Critérios de Periculosidade — Art. 312, §3º (Lei 15.272/2025)</div>

ANTES:  <div class="section-title">Admissibilidade (Art. 313)</div>
DEPOIS: <div id="admissibilidade-preventiva" class="section-title">Admissibilidade (Art. 313)</div>

ANTES:  <div class="section-title">Fundamentação e Prazo</div>
DEPOIS: <div id="fundamentacao-prazo" class="section-title">Fundamentação e Prazo</div>

ANTES:  <div class="section-title">Não Cabimento (Art. 314)</div>
DEPOIS: <div id="nao-cabimento" class="section-title">Não Cabimento (Art. 314)</div>

ANTES:  <div class="section-title" style="margin-top:2rem;">Infográfico — Guia da Prisão Preventiva</div>
DEPOIS: <div id="infografico-preventiva" class="section-title" style="margin-top:2rem;">Infográfico — Guia da Prisão Preventiva</div>

ANTES:  <div class="section-title">Prisão Temporária (Lei 7.960/89)</div>
DEPOIS: <div id="temporaria-conceito" class="section-title">Prisão Temporária (Lei 7.960/89)</div>

ANTES:  <div class="section-title">Requisitos Cumulativos</div>
DEPOIS: <div id="requisitos-temporaria" class="section-title">Requisitos Cumulativos</div>

ANTES:  <div class="section-title">Prazos</div>
DEPOIS: <div id="prazos-temporaria" class="section-title">Prazos</div>

ANTES:  <div class="section-title">Medidas Cautelares Diversas da Prisão (Art. 319)</div>
DEPOIS: <div id="cautelares-art319" class="section-title">Medidas Cautelares Diversas da Prisão (Art. 319)</div>

ANTES:  <div class="section-title">Principiologia das Cautelares (Art. 282)</div>
DEPOIS: <div id="principiologia-cautelares" class="section-title">Principiologia das Cautelares (Art. 282)</div>

ANTES:  <div class="section-title">Prisão Domiciliar (Arts. 317–318-B)</div>
DEPOIS: <div id="domiciliar-conceito" class="section-title">Prisão Domiciliar (Arts. 317–318-B)</div>

ANTES:  <div class="section-title">Hipóteses de Substituição da Preventiva por Domiciliar</div>
DEPOIS: <div id="hipoteses-domiciliar" class="section-title">Hipóteses de Substituição da Preventiva por Domiciliar</div>

ANTES:  <div class="section-title">Fiança</div>
DEPOIS: <div id="fianca" class="section-title">Fiança</div>

ANTES:  <div class="section-title">Quadro Comparativo — Três Prisões Cautelares</div>
DEPOIS: <div id="quadro-prisoes" class="section-title">Quadro Comparativo — Três Prisões Cautelares</div>

ANTES:  <div class="section-title">Prisão Domiciliar × Medidas Cautelares Diversas</div>
DEPOIS: <div id="domiciliar-vs-cautelares" class="section-title">Prisão Domiciliar × Medidas Cautelares Diversas</div>

ANTES:  <div class="section-title">Checklist da Prisão Preventiva</div>
DEPOIS: <div id="checklist-preventiva" class="section-title">Checklist da Prisão Preventiva</div>

ANTES:  <div class="section-title">Roteiro de Estudo — Prisões</div>
DEPOIS: <div id="roteiro-prisoes" class="section-title">Roteiro de Estudo — Prisões</div>

ANTES:  <div class="section-title">Jurisprudência Estruturante</div>
DEPOIS: <div id="jurisprudencia-prisoes" class="section-title">Jurisprudência Estruturante</div>

ANTES:  <div class="section-title">Casos Práticos — Prisões</div>
DEPOIS: <div id="casos-prisoes" class="section-title">Casos Práticos — Prisões</div>

ANTES:  <div class="section-title">Guia Prático — Prisões e Medidas Cautelares</div>
DEPOIS: <div id="guia-prisoes" class="section-title">Guia Prático — Prisões e Medidas Cautelares</div>
```

- [ ] **Step 3: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/processual-penal-ii/03-prisoes.html | sort | uniq -d
```

- [ ] **Step 4: Commit**

```bash
git add conteudo/processual-penal-ii/03-prisoes.html
git commit -m "feat(conteudo): adiciona ids em processual-penal-ii/03-prisoes"
```

---

## Task 13: IDs em `penal/penal-iv/01-fe-publica.html`

**Files:**
- Modify: `conteudo/penal/penal-iv/01-fe-publica.html`

Este arquivo usa `h3` como cabeçalhos de seção (sem tab panels). Adicionar `id` diretamente nos `h3`.

- [ ] **Step 1: Inspecionar a estrutura do arquivo para confirmar linhas**

```bash
grep -n "<h3" conteudo/penal/penal-iv/01-fe-publica.html | head -20
```

- [ ] **Step 2: Adicionar IDs nos `h3` principais**

```
ANTES:  <h3>💰 Moeda Falsa e Crimes Assimilados (arts. 289–291)</h3>
DEPOIS: <h3 id="moeda-falsa">💰 Moeda Falsa e Crimes Assimilados (arts. 289–291)</h3>

ANTES:  <h3>📄 Falsificação de Papéis Públicos (arts. 292–295)</h3>
DEPOIS: <h3 id="papeis-publicos">📄 Falsificação de Papéis Públicos (arts. 292–295)</h3>

ANTES:  <h3>🔏 Falsificação de Selo ou Sinal Público (art. 296)</h3>
DEPOIS: <h3 id="selo-sinal-publico">🔏 Falsificação de Selo ou Sinal Público (art. 296)</h3>

ANTES:  <h3>📝 Falsidade Documental — material e ideológica (arts. 297–305)</h3>
DEPOIS: <h3 id="falsidade-documental">📝 Falsidade Documental — material e ideológica (arts. 297–305)</h3>

ANTES:  <h3>🪪 Demais Falsidades (arts. 300–311)</h3>
DEPOIS: <h3 id="demais-falsidades">🪪 Demais Falsidades (arts. 300–311)</h3>

ANTES:  <h3>⚖️ Jurisprudência Estruturante</h3>
DEPOIS: <h3 id="jurisprudencia-fe-publica">⚖️ Jurisprudência Estruturante</h3>

ANTES:  <h3>Roteiro de Estudo — Crimes contra a Fé Pública</h3>
DEPOIS: <h3 id="roteiro-fe-publica">Roteiro de Estudo — Crimes contra a Fé Pública</h3>
```

- [ ] **Step 3: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/penal/penal-iv/01-fe-publica.html | sort | uniq -d
```

- [ ] **Step 4: Commit**

```bash
git add conteudo/penal/penal-iv/01-fe-publica.html
git commit -m "feat(conteudo): adiciona ids em penal-iv/01-fe-publica"
```

---

## Task 14: IDs em `penal/penal-iv/02-adm-publica.html`

**Files:**
- Modify: `conteudo/penal/penal-iv/02-adm-publica.html`

Tab panels existentes: `tab-mapa` (active), `tab-conceitual`, `tab-sinoptico`, `tab-roteiro`, `tab-caso`. Classe usada: `tab-content active` (não `ativo`).

- [ ] **Step 1: Inspecionar seções dentro dos tab panels**

```bash
grep -n "section-title\|<h2\|<h3" conteudo/penal/penal-iv/02-adm-publica.html | grep -v "css\|color\|font" | head -30
```

- [ ] **Step 2: Adicionar IDs nas seções encontradas**

Com base na inspeção do Step 1, adicionar `id` nos `section-title` divs ou `h3` dentro de cada tab panel. Padrão sugerido:
- Mapa mental → `id="mapa-adm-publica"`
- Peculato → `id="peculato"`
- Concussão → `id="concussao"`
- Corrupção passiva → `id="corrupcao-passiva"`
- Corrupção ativa → `id="corrupcao-ativa"`
- Jurisprudência → `id="jurisprudencia-adm-publica"`
- Roteiro → `id="roteiro-adm-publica"`

Se a estrutura real diferir do padrão sugerido, usar os IDs que melhor representem o conteúdo encontrado (kebab-case, sem acentos, únicos).

- [ ] **Step 3: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/penal/penal-iv/02-adm-publica.html | sort | uniq -d
```

- [ ] **Step 4: Commit**

```bash
git add conteudo/penal/penal-iv/02-adm-publica.html
git commit -m "feat(conteudo): adiciona ids em penal-iv/02-adm-publica"
```

---

## Task 15: IDs em `penal/penal-iv/03-sentimento-religioso.html`

**Files:**
- Modify: `conteudo/penal/penal-iv/03-sentimento-religioso.html`

Tab panels existentes: `sr-tabela` (ativo), `sr-mapa`, `sr-roteiro`, `sr-caso`.

- [ ] **Step 1: Inspecionar seções dentro dos tab panels**

```bash
grep -n "section-title\|<h2\|<h3" conteudo/penal/penal-iv/03-sentimento-religioso.html | grep -v "css\|color\|font" | head -30
```

- [ ] **Step 2: Adicionar IDs nas seções encontradas**

Padrão sugerido:
- Ultraje ao culto → `id="ultraje-culto"`
- Impedimento de culto → `id="impedimento-culto"`
- Mapa mental → `id="mapa-sentimento-religioso"`
- Jurisprudência → `id="jurisprudencia-sentimento"`
- Roteiro → `id="roteiro-sentimento"`

Se a estrutura real diferir, usar IDs que melhor representem o conteúdo.

- [ ] **Step 3: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/penal/penal-iv/03-sentimento-religioso.html | sort | uniq -d
```

- [ ] **Step 4: Commit**

```bash
git add conteudo/penal/penal-iv/03-sentimento-religioso.html
git commit -m "feat(conteudo): adiciona ids em penal-iv/03-sentimento-religioso"
```

---

## Task 16: IDs em `processual-penal-iii/01-procedimentos.html`

**Files:**
- Modify: `conteudo/processual-penal-iii/01-procedimentos.html`

Tab panels existentes: `fp-p-visao` (ativo), `fp-p-mapa`, `fp-p-roteiro`, `fp-p-caso`.

- [ ] **Step 1: Inspecionar seções**

```bash
grep -n "section-title\|<h2\|<h3" conteudo/processual-penal-iii/01-procedimentos.html | grep -v "css\|color\|font" | head -30
```

- [ ] **Step 2: Adicionar IDs nas seções encontradas**

Padrão sugerido (ajustar conforme o conteúdo real):
- Devido processo legal → `id="devido-processo"`
- Critério pela pena → `id="criterio-pena"`
- Rito ordinário → `id="rito-ordinario"`
- Instrução e AIJ → `id="instrucao-aij"`
- Alegações finais → `id="alegacoes-finais"`
- Sentença → `id="sentenca"`
- Jurisprudência → `id="jurisprudencia-procedimentos"`

- [ ] **Step 3: Verificar ausência de duplicados**

```bash
grep -o 'id="[^"]*"' conteudo/processual-penal-iii/01-procedimentos.html | sort | uniq -d
```

- [ ] **Step 4: Commit**

```bash
git add conteudo/processual-penal-iii/01-procedimentos.html
git commit -m "feat(conteudo): adiciona ids em processual-penal-iii/01-procedimentos"
```

---

## Task 17: Verificação final e commit de fechamento

- [ ] **Step 1: Verificar sitemap**

```bash
node scripts/gerar-sitemap.js
```

Esperado: executa sem erro. O sitemap não usa hash, então nenhuma mudança é esperada.

- [ ] **Step 2: Checar console no browser — todos os cenários**

Abrir DevTools → Console. Testar cada item:

| # | Ação | Esperado |
|---|------|----------|
| 1 | Colar `/tributario/tributario-financeiro-i/01-guia-estudos#reparticao-de-receitas` | Tema abre, scroll até "Repartição de Receitas" |
| 2 | Navegar para outro tema, Alt+← de volta, Alt+→ | Scroll funciona novamente |
| 3 | Colar URL acima em aba anônima | Mesmo comportamento |
| 4 | F5 numa URL com hash | Mantém tema e scroll |
| 5 | Ativar Reduce Motion no SO, testar item 1 | Scroll instantâneo (sem animação) |
| 6 | Usar busca global | Funciona normalmente |
| 7 | Verificar console | Sem erros novos |

- [ ] **Step 3: Verificar dois deep links de exemplo**

```
Tributário:        /tributario/tributario-financeiro-i/01-guia-estudos#reparticao-de-receitas
Proc. Penal:       /processual-penal/processual-penal-ii/03-prisoes#pp3-flagrante
```

Ambos devem abrir o tema correto e ativar/rolar para a seção.

- [ ] **Step 4: Commit final de fechamento**

```bash
git add -A
git commit -m "chore: verificação final — deep linking com hash implementado"
```

---

## Referência de IDs por arquivo

| Arquivo | ID | Seção |
|---------|-----|-------|
| `01-guia-estudos.html` | `especies-tributarias` | Espécies Tributárias |
| `01-guia-estudos.html` | `ciclo-credito` | Ciclo do Crédito |
| `01-guia-estudos.html` | `modificacao-credito` | Suspensão/Extinção/Exclusão |
| `01-guia-estudos.html` | `principios` | Princípios Constitucionais |
| `01-guia-estudos.html` | `reparticao-de-receitas` | Repartição de Receitas |
| `01-guia-estudos.html` | `unidade-1` … `unidade-7` | Unidades do roteiro |
| `01-fazenda-publica.html` | `fazenda-conceito` | O que é a Fazenda Pública |
| `01-fazenda-publica.html` | `prerrogativas` | Prerrogativas Processuais |
| `01-fazenda-publica.html` | `honorarios` | Honorários |
| `01-fazenda-publica.html` | `precatorios-rpv` | Precatórios e RPV |
| `01-fazenda-publica.html` | `limitacoes-tutelares` | Limitações Tutelares |
| `02-lancamento.html` | `lancamento-conceito` | O Ato de Lançamento |
| `02-lancamento.html` | `funcoes-lancamento` | 5 Funções do Lançamento |
| `02-lancamento.html` | `modalidades-lancamento` | Modalidades |
| `02-lancamento.html` | `regra-tempo` | Regra do Tempo |
| `02-lancamento.html` | `revisao-lancamento` | Revisão e Alteração |
| `03-execucao-fiscal.html` | `fases-execucao` | 4 Fases da LEF |
| `03-execucao-fiscal.html` | `linha-do-tempo` | Do Nascimento ao Título |
| `03-execucao-fiscal.html` | `defesas` | Defesas do Devedor |
| `03-execucao-fiscal.html` | `expropriacao` | Expropriação |
| `03-execucao-fiscal.html` | `prescricao-decadencia-lef` | Prescrição/Decadência |
| `03-prisoes.html` | `pp3-flagrante` (tab panel) | Aba Flagrante |
| `03-prisoes.html` | `pp3-preventiva` (tab panel) | Aba Preventiva |
| `03-prisoes.html` | `pp3-temporaria` (tab panel) | Aba Temporária |
| `03-prisoes.html` | `fianca` | Fiança |
| `03-prisoes.html` | `jurisprudencia-prisoes` | Jurisprudência |
| `01-teoria-geral-provas.html` | `pp1-ilicita` (tab panel) | Aba Prova Ilícita |
| `01-teoria-geral-provas.html` | `prova-ilicita` | Prova Ilícita × Ilegítima |
| `01-teoria-geral-provas.html` | `arvore-envenenada` | Teoria dos Frutos |
| `01-teoria-geral-provas.html` | `cadeia-custodia` | Cadeia de Custódia |
| `02-provas-em-especie.html` | `pp2-reconhecimento` (tab panel) | Aba Reconhecimento |
| `02-provas-em-especie.html` | `reconhecimento-fotografico` | Reconhecimento Fotográfico |
