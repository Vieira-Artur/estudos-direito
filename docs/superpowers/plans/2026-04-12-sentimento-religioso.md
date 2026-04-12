# Crimes contra o Sentimento Religioso — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Criar `03-sentimento-religioso.html` no padrão de `01-fe-publica.html` (4 abas: Tabela, Mapa Mental, Roteiro, Estudo de Caso), deletar os 6 arquivos fragmentados antigos e registrar o novo arquivo em `data.js` e `index.html`.

**Architecture:** Arquivo HTML único auto-contido (CSS + HTML + JS inline), sem dependências externas além das variáveis CSS globais do site (`--blue`, `--gold`, `--sans`, `--serif`, etc. definidas em `style.css`). Prefixo `sr-` para todas as classes CSS. JavaScript em IIFE no final do arquivo.

**Tech Stack:** HTML5, CSS3 (variáveis CSS, grid, flexbox), JavaScript vanilla. Sem frameworks ou bundlers.

---

## Mapa de arquivos

| Ação | Arquivo |
|------|---------|
| Deletar | `conteudo/penal/penal-iv/sentimento-religioso.html` |
| Deletar | `conteudo/penal/penal-iv/sentimento-religioso-mapa.html` |
| Deletar | `conteudo/penal/penal-iv/sentimento-religioso-roteiro.html` |
| Deletar | `conteudo/penal/penal-iv/sentimento-religioso-tabela.html` |
| Deletar | `conteudo/penal/penal-iv/sentimento-religioso-smartart.html` |
| Deletar | `conteudo/penal/penal-iv/sentimento-religioso-smartart.svg` |
| Criar   | `conteudo/penal/penal-iv/03-sentimento-religioso.html` |
| Modificar | `conteudo/penal/penal-iv/index.html` |
| Modificar | `data.js` |

---

## Task 1: Limpar arquivos antigos + registrar novo em data.js e index.html

**Files:**
- Delete: `conteudo/penal/penal-iv/sentimento-religioso*.html` e `.svg`
- Modify: `data.js` (linhas 8–22 aprox.)
- Modify: `conteudo/penal/penal-iv/index.html` (após linha 67)

- [ ] **Step 1: Deletar os 6 arquivos fragmentados**

```bash
cd conteudo/penal/penal-iv
rm sentimento-religioso.html sentimento-religioso-mapa.html sentimento-religioso-roteiro.html sentimento-religioso-tabela.html sentimento-religioso-smartart.html sentimento-religioso-smartart.svg
```

- [ ] **Step 2: Adicionar entrada em `data.js`**

Localizar o bloco do `penal-iv` em `data.js`. Ele termina assim:
```js
            arquivo: "conteudo/penal/penal-iv/02-adm-publica.html"
```

Adicionar após essa linha (dentro do mesmo array `topicos`):
```js
          },
          {
            titulo: "Crimes contra o Sentimento Religioso",
            arquivo: "conteudo/penal/penal-iv/03-sentimento-religioso.html"
          }
```

- [ ] **Step 3: Adicionar card em `conteudo/penal/penal-iv/index.html`**

Localizar a linha que contém `</div>\n</div>` (fechamento de `.piv-idx-cards` e `.piv-idx`). Adicionar antes do primeiro `</div>` de fechamento:

```html
    <a href="03-sentimento-religioso.html" class="piv-idx-card piv-idx-card-3">
      <div class="piv-idx-num">Unidade 3</div>
      <h2>Crimes contra o Sentimento Religioso</h2>
      <p>Tabela comparativa · Mapa mental · Roteiro de estudo · Estudo de caso · Arts. 208–212 CP</p>
    </a>
```

E adicionar no bloco `<style>` do mesmo arquivo, após `.piv-idx-card-2 .piv-idx-num { color: var(--gold); }`:

```css
.piv-idx-card-3 { border-top: 3px solid #4a1a8a; }
.piv-idx-card-3 .piv-idx-num { color: #4a1a8a; }
```

- [ ] **Step 4: Commit**

```bash
git add data.js conteudo/penal/penal-iv/index.html
git commit -m "chore(penal-iv): remove arquivos fragmentados sentimento-religioso e registra novo guia"
```

---

## Task 2: Criar arquivo base com CSS e sistema de abas

**Files:**
- Create: `conteudo/penal/penal-iv/03-sentimento-religioso.html`

- [ ] **Step 1: Criar o arquivo com CSS completo e shell de abas**

Criar `conteudo/penal/penal-iv/03-sentimento-religioso.html` com o conteúdo abaixo. Este é o esqueleto completo — as abas ficam vazias por enquanto (preenchidas nas Tasks seguintes):

```html
<style>
/* ── Variáveis de acento ──────────────────────────────── */
:root {
  --sr-purple:    #4a1a8a;
  --sr-purple-lt: #ede5fb;
  --sr-red:       #8b1a1a;
  --sr-red-lt:    #fce8e8;
  --sr-orange:    #7a3800;
  --sr-orange-lt: #fdebd6;
  --sr-green:     #1a5c1a;
  --sr-green-lt:  #d6f0d6;
  --sr-teal:      #0a5c4a;
  --sr-teal-lt:   #d6f0e8;
}
@media (prefers-color-scheme: dark) {
  :root {
    --sr-purple:    #c0a0f8;
    --sr-purple-lt: #200a40;
    --sr-red:       #f08080;
    --sr-red-lt:    #2e0d0d;
    --sr-orange:    #f0a060;
    --sr-orange-lt: #2e1500;
    --sr-green:     #6fd86f;
    --sr-green-lt:  #0d2e0d;
    --sr-teal:      #60d8b8;
    --sr-teal-lt:   #072e22;
  }
}

/* ── Abas ─────────────────────────────────────────────── */
.sr-tabs {
  display: flex; gap: 4px; margin-bottom: 22px; flex-wrap: wrap;
}
.sr-tab {
  padding: 7px 18px;
  font-size: 13px; font-weight: 600; font-family: var(--sans);
  border: 1.5px solid var(--blue); border-radius: 6px; cursor: pointer;
  background: var(--surface); color: var(--blue);
  transition: background .15s, color .15s;
}
.sr-tab:hover { background: var(--blue-hover); }
.sr-tab.ativo  { background: var(--blue); color: #fff; }
.sr-painel { display: none; }
.sr-painel.ativo { display: block; }

/* ── Título ───────────────────────────────────────────── */
.sr-titulo {
  font-family: var(--serif); font-size: 19px; font-weight: 700;
  color: var(--blue); margin-bottom: 18px;
  padding-bottom: 10px; border-bottom: 2px solid var(--border);
}

/* ── Section title ────────────────────────────────────── */
.sr-sec {
  font-family: var(--serif); font-size: 15px; font-weight: 700; color: var(--blue);
  border-left: 3px solid var(--gold); padding-left: 10px; margin: 24px 0 12px;
}
.sr-sec:first-child { margin-top: 0; }

/* ── Tabela ───────────────────────────────────────────── */
.sr-tbl-wrap { overflow-x: auto; margin: 10px 0 18px; border-radius: 8px; }
.sr-tbl { width: 100%; border-collapse: collapse; font-size: 12.5px; min-width: 760px; }
.sr-tbl thead th {
  background: var(--blue); color: #fff;
  padding: 9px 11px; text-align: left; font-weight: 600;
  font-family: var(--sans); font-size: 11.5px;
}
.sr-tbl tbody td {
  padding: 8px 11px; border-bottom: 1px solid var(--border);
  vertical-align: top; color: var(--text); line-height: 1.55;
}
.sr-tbl tbody tr:nth-child(even) td { background: var(--blue-light); }
.sr-tbl tbody td:first-child { font-weight: 700; color: var(--blue); white-space: nowrap; }
.sr-badge {
  display: inline-block; font-size: 11px; font-weight: 600;
  border-radius: 4px; padding: 2px 7px; margin: 1px 2px;
}
.sr-b-det  { background: var(--blue-light);    color: var(--blue); }
.sr-b-rec  { background: var(--sr-red-lt);     color: var(--sr-red); }
.sr-b-mul  { background: var(--sr-orange-lt);  color: var(--sr-orange); }
.sr-b-vio  { background: var(--sr-purple-lt);  color: var(--sr-purple); }
.sr-b-ok   { background: var(--sr-green-lt);   color: var(--sr-green); }

/* ── Mapa Mental ──────────────────────────────────────── */
.sr-mm-wrap { }
.sr-mm-layout {
  display: flex; gap: 12px; flex-wrap: wrap; margin-bottom: 16px;
}
.sr-mm-branch {
  flex: 1; min-width: 140px; max-width: 190px;
  background: var(--surface); border: 2px solid var(--border);
  border-radius: 10px; padding: 14px 16px; cursor: pointer;
  transition: border-color .15s, transform .15s; text-align: center;
}
.sr-mm-branch:hover { transform: translateY(-2px); border-color: var(--sr-purple); }
.sr-mm-branch.ativo { border-color: var(--sr-purple); background: var(--sr-purple-lt); }
.sr-mm-icon  { font-size: 24px; margin-bottom: 6px; }
.sr-mm-label { font-size: 12px; font-weight: 700; color: var(--blue); font-family: var(--sans); }
.sr-mm-arts  { font-size: 11px; color: var(--text2); margin-top: 3px; font-family: var(--sans); }
.sr-mm-detail {
  display: none; background: var(--surface); border: 1.5px solid var(--sr-purple);
  border-radius: 10px; padding: 20px 22px; margin-bottom: 16px;
}
.sr-mm-detail.ativo { display: block; }
.sr-mm-detail h3 {
  font-size: 15px; font-weight: 700; color: var(--sr-purple);
  margin-bottom: 12px; font-family: var(--serif);
}
.sr-mm-detail ul { padding-left: 16px; }
.sr-mm-detail li { font-size: 13px; color: var(--text2); line-height: 1.6; margin-bottom: 6px; }
.sr-mm-detail li strong { color: var(--text); }
.sr-mm-note {
  background: var(--sr-purple-lt); border-left: 3px solid var(--sr-purple);
  border-radius: 0 5px 5px 0; padding: 8px 12px; margin-top: 10px;
  font-size: 12px; color: var(--text); line-height: 1.55;
}
.sr-mm-note strong { color: var(--sr-purple); }

/* ── Roteiro ──────────────────────────────────────────── */
.sr-rot-intro {
  background: var(--blue); border-radius: 10px;
  padding: 20px 22px; color: #fff; margin-bottom: 20px;
}
.sr-rot-intro h3 { font-size: 16px; margin-bottom: 8px; font-family: var(--serif); }
.sr-rot-intro p  { font-size: 13px; line-height: 1.6; opacity: .9; }
.sr-rot-tags { margin-top: 12px; display: flex; flex-wrap: wrap; gap: 6px; }
.sr-rot-tag  {
  background: rgba(255,255,255,.15); border: 1px solid rgba(255,255,255,.25);
  border-radius: 5px; padding: 4px 10px; font-size: 11.5px; font-family: var(--sans);
}
.sr-unit { margin-bottom: 28px; }
.sr-unit-hd {
  display: flex; align-items: center; gap: 10px;
  margin-bottom: 12px; cursor: pointer; user-select: none;
}
.sr-unit-num {
  width: 36px; height: 36px; border-radius: 50%;
  background: var(--blue); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 15px; flex-shrink: 0;
}
.sr-unit-title { font-size: 15px; font-weight: 700; color: var(--blue); flex: 1; font-family: var(--serif); }
.sr-unit-tog   { font-size: 16px; color: var(--text2); transition: transform .2s; }
.sr-unit-tog.aberto { transform: rotate(180deg); }
.sr-unit-body  { display: none; }
.sr-unit-body.aberto { display: block; }

.sr-step { background: var(--surface); border: 1px solid var(--border); border-radius: 9px; margin-bottom: 10px; overflow: hidden; }
.sr-step-hd {
  display: flex; align-items: flex-start; gap: 10px; padding: 12px 14px; cursor: pointer;
}
.sr-step-chk {
  width: 20px; height: 20px; border-radius: 50%;
  border: 2px solid var(--border); display: flex; align-items: center;
  justify-content: center; flex-shrink: 0; margin-top: 2px; transition: all .15s;
}
.sr-step-chk svg { display: none; width: 11px; height: 11px; }
.sr-step.feito .sr-step-chk { background: var(--blue); border-color: var(--blue); }
.sr-step.feito .sr-step-chk svg { display: block; }
.sr-step-title { font-size: 13.5px; font-weight: 600; color: var(--text); flex: 1; line-height: 1.4; }
.sr-step.feito .sr-step-title { text-decoration: line-through; color: var(--text2); }
.sr-step-meta  { font-size: 11px; color: var(--text2); margin-top: 2px; }
.sr-step-exp   { font-size: 14px; color: var(--text2); flex-shrink: 0; padding-top: 2px; }
.sr-step-body  { display: none; padding: 0 14px 14px 44px; border-top: 1px solid var(--border); }
.sr-step-body.aberto { display: block; }
.sr-step-body p  { font-size: 12.5px; line-height: 1.65; margin-bottom: 8px; color: var(--text); }
.sr-step-body ul { margin-left: 14px; font-size: 12.5px; line-height: 1.65; color: var(--text); }
.sr-step-body li { margin-bottom: 4px; }

.sr-art-box {
  background: var(--blue-light); border-left: 3px solid var(--blue);
  border-radius: 0 5px 5px 0; padding: 8px 12px; margin: 8px 0;
  font-size: 12px; line-height: 1.55; font-style: italic; color: var(--text);
}
.sr-warn-box {
  background: var(--sr-red-lt); border-left: 3px solid var(--sr-red);
  border-radius: 0 5px 5px 0; padding: 8px 12px; margin: 8px 0;
  font-size: 12px; line-height: 1.55; color: var(--text);
}
.sr-warn-box strong { color: var(--sr-red); }
.sr-ok-box {
  background: var(--sr-green-lt); border-left: 3px solid var(--sr-green);
  border-radius: 0 5px 5px 0; padding: 8px 12px; margin: 8px 0;
  font-size: 12px; line-height: 1.55; color: var(--text);
}
.sr-ok-box strong { color: var(--sr-green); }
.sr-doc-box {
  background: var(--sr-purple-lt); border-left: 3px solid var(--sr-purple);
  border-radius: 0 5px 5px 0; padding: 8px 12px; margin: 8px 0;
  font-size: 12px; line-height: 1.55; color: var(--text);
}
.sr-doc-box strong { color: var(--sr-purple); }

/* ── Estudo de Caso ───────────────────────────────────── */
.sr-ec-header {
  background: var(--blue); border-radius: 10px;
  padding: 22px 26px; color: #fff; margin-bottom: 22px;
}
.sr-ec-op  { font-size: 11px; font-weight: 600; letter-spacing: .1em; text-transform: uppercase; color: rgba(255,255,255,.65); margin-bottom: 6px; font-family: var(--sans); }
.sr-ec-header h3 { font-size: 21px; font-family: var(--serif); margin-bottom: 8px; }
.sr-ec-header p  { font-size: 13px; opacity: .88; line-height: 1.6; }
.sr-ec-meta { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 12px; }
.sr-ec-tag  { background: rgba(255,255,255,.14); border: 1px solid rgba(255,255,255,.22); border-radius: 5px; padding: 3px 10px; font-size: 11.5px; font-family: var(--sans); }

.sr-q-list { display: flex; flex-direction: column; gap: 14px; }
.sr-q-item { background: var(--surface); border: 1.5px solid var(--border); border-radius: 9px; overflow: hidden; }
.sr-q-hd   { display: flex; align-items: flex-start; gap: 10px; padding: 14px 16px; cursor: pointer; }
.sr-q-num  {
  width: 30px; height: 30px; border-radius: 50%;
  background: var(--sr-purple); color: #fff;
  display: flex; align-items: center; justify-content: center;
  font-weight: 700; font-size: 13px; flex-shrink: 0;
}
.sr-q-text  { font-size: 13.5px; line-height: 1.5; flex: 1; font-weight: 500; color: var(--text); }
.sr-q-meta  { font-size: 11px; color: var(--text2); margin-top: 2px; font-weight: 400; }
.sr-q-arr   { color: var(--text2); font-size: 15px; flex-shrink: 0; padding-top: 2px; transition: transform .2s; }
.sr-q-arr.aberto { transform: rotate(180deg); }
.sr-q-body  { display: none; padding: 0 16px 16px 56px; border-top: 1px solid var(--border); }
.sr-q-body.aberto { display: block; }
.sr-q-body p { font-size: 12.5px; line-height: 1.65; margin-bottom: 8px; color: var(--text); }
.sr-q-body ul { margin-left: 14px; font-size: 12.5px; line-height: 1.7; }
.sr-q-body li { margin-bottom: 4px; color: var(--text); }
</style>

<!-- ═══════════════════════════════════════════════════════
     ABAS
═══════════════════════════════════════════════════════ -->
<div class="sr-titulo">Crimes contra o Sentimento Religioso · Arts. 208–212 CP</div>

<div class="sr-tabs">
  <button class="sr-tab ativo" onclick="srTab('tabela', this)">Tabela Comparativa</button>
  <button class="sr-tab" onclick="srTab('mapa', this)">Mapa Mental</button>
  <button class="sr-tab" onclick="srTab('roteiro', this)">Roteiro de Estudo</button>
  <button class="sr-tab" onclick="srTab('caso', this)">Estudo de Caso</button>
</div>

<!-- ABA 1 -->
<div id="sr-tabela" class="sr-painel ativo">
  <!-- Task 3 -->
</div>

<!-- ABA 2 -->
<div id="sr-mapa" class="sr-painel">
  <!-- Task 4 -->
</div>

<!-- ABA 3 -->
<div id="sr-roteiro" class="sr-painel">
  <!-- Task 5 -->
</div>

<!-- ABA 4 -->
<div id="sr-caso" class="sr-painel">
  <!-- Task 6 -->
</div>

<script>
;(function() {
  // Task 7 — JavaScript
})()
</script>
```

- [ ] **Step 2: Verificar que o arquivo existe**

```bash
ls conteudo/penal/penal-iv/03-sentimento-religioso.html
```
Esperado: arquivo listado.

- [ ] **Step 3: Commit**

```bash
git add conteudo/penal/penal-iv/03-sentimento-religioso.html
git commit -m "feat(penal-iv): cria shell de 03-sentimento-religioso com CSS e sistema de abas"
```

---

## Task 3: Aba 1 — Tabela Comparativa (Arts. 208–212)

**Files:**
- Modify: `conteudo/penal/penal-iv/03-sentimento-religioso.html` (substituir `<!-- Task 3 -->` dentro de `#sr-tabela`)

- [ ] **Step 1: Substituir o placeholder `<!-- Task 3 -->` pelo HTML abaixo**

```html
  <div class="sr-sec">Quadro Comparativo — Arts. 208 a 212 CP</div>
  <div class="sr-tbl-wrap">
    <table class="sr-tbl">
      <thead>
        <tr>
          <th>Artigo</th>
          <th>Crime</th>
          <th>Condutas típicas</th>
          <th>Pena base</th>
          <th>Observações</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Art. 208</td>
          <td>Ultraje a culto e impedimento ou perturbação de ato religioso</td>
          <td>
            <strong>Escarnecer</strong> de alguém publicamente por motivo de crença ou função religiosa<br>
            <strong>Impedir ou perturbar</strong> cerimônia ou prática de culto religioso<br>
            <strong>Vilipendiar</strong> publicamente ato ou objeto de culto religioso
          </td>
          <td>
            <span class="sr-badge sr-b-det">Detenção 1m–1a</span>
            <span class="sr-badge sr-b-mul">ou Multa</span><br>
            <span class="sr-badge sr-b-vio">+1/3 se violência</span>
          </td>
          <td>
            Exige <strong>publicidade</strong> e motivação religiosa.<br>
            CF art. 5º, VI: liberdade de crença é inviolável.<br>
            Crítica religiosa legítima ≠ escárnio típico.<br>
            <span class="sr-badge sr-b-ok">Crime comum</span>
          </td>
        </tr>
        <tr>
          <td>Art. 209</td>
          <td>Impedimento ou perturbação de cerimônia funerária</td>
          <td>
            <strong>Impedir ou perturbar</strong> enterro ou cerimônia funerária
          </td>
          <td>
            <span class="sr-badge sr-b-det">Detenção 1m–1a</span>
            <span class="sr-badge sr-b-mul">ou Multa</span><br>
            <span class="sr-badge sr-b-vio">+1/3 se violência</span>
          </td>
          <td>
            <span class="sr-badge sr-b-ok">Crime comum</span> — qualquer pessoa pode ser sujeito ativo.<br>
            Bem jurídico: sentimento de respeito aos mortos.<br>
            Não exige motivação religiosa.
          </td>
        </tr>
        <tr>
          <td>Art. 210</td>
          <td>Violação de sepultura</td>
          <td>
            <strong>Violar ou profanar</strong> sepultura ou urna funerária
          </td>
          <td>
            <span class="sr-badge sr-b-rec">Reclusão 1–3a</span>
            <span class="sr-badge sr-b-mul">e Multa</span>
          </td>
          <td>
            Sepultura = cova + túmulo + ornamentos + objetos ligados ao local.<br>
            <strong>Não existe forma culposa.</strong><br>
            <span class="sr-badge sr-b-ok">Crime comum</span>
          </td>
        </tr>
        <tr>
          <td>Art. 211</td>
          <td>Destruição, subtração ou ocultação de cadáver</td>
          <td>
            <strong>Destruir</strong>, <strong>subtrair</strong> ou <strong>ocultar</strong> cadáver ou parte dele
          </td>
          <td>
            <span class="sr-badge sr-b-rec">Reclusão 1–3a</span>
            <span class="sr-badge sr-b-mul">e Multa</span>
          </td>
          <td>
            Partes protegidas: separadas em razão da morte ou retiradas <em>após</em> a morte.<br>
            Partes amputadas de corpo vivo: <strong>não protegidas</strong> (Rogério Sanches).<br>
            <span class="sr-badge sr-b-ok">Crime comum</span>
          </td>
        </tr>
        <tr>
          <td>Art. 212</td>
          <td>Vilipêndio a cadáver</td>
          <td>
            <strong>Vilipendiar</strong> cadáver ou suas cinzas (atos, palavras ou escritos)
          </td>
          <td>
            <span class="sr-badge sr-b-det">Detenção 1–3a</span>
            <span class="sr-badge sr-b-mul">e Multa</span>
          </td>
          <td>
            Exige ação realizada <em>sobre ou junto</em> ao cadáver ou cinzas.<br>
            <span class="sr-badge sr-b-ok">Execução livre</span> — qualquer meio.<br>
            <span class="sr-badge sr-b-ok">Crime comum</span>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
```

- [ ] **Step 2: Verificar visualmente no browser**

Abrir `index.html` do site no browser e navegar até Penal IV → Unidade 3 → aba Tabela. Confirmar: 5 linhas, badges coloridos, pena de Art. 212 mostra detenção 1–3a.

- [ ] **Step 3: Commit**

```bash
git add conteudo/penal/penal-iv/03-sentimento-religioso.html
git commit -m "feat(penal-iv): aba Tabela Comparativa Arts. 208-212"
```

---

## Task 4: Aba 2 — Mapa Mental interativo

**Files:**
- Modify: `conteudo/penal/penal-iv/03-sentimento-religioso.html` (substituir `<!-- Task 4 -->` dentro de `#sr-mapa`)

- [ ] **Step 1: Substituir o placeholder `<!-- Task 4 -->` pelo HTML abaixo**

```html
  <div class="sr-mm-wrap">
    <div class="sr-mm-layout">
      <div class="sr-mm-branch" id="srb-208" onclick="srBranch('208')">
        <div class="sr-mm-icon">⛪</div>
        <div class="sr-mm-label">Ultraje a Culto</div>
        <div class="sr-mm-arts">Art. 208</div>
      </div>
      <div class="sr-mm-branch" id="srb-209" onclick="srBranch('209')">
        <div class="sr-mm-icon">⚰️</div>
        <div class="sr-mm-label">Cerimônia Funerária</div>
        <div class="sr-mm-arts">Art. 209</div>
      </div>
      <div class="sr-mm-branch" id="srb-210" onclick="srBranch('210')">
        <div class="sr-mm-icon">🪦</div>
        <div class="sr-mm-label">Violação de Sepultura</div>
        <div class="sr-mm-arts">Art. 210</div>
      </div>
      <div class="sr-mm-branch" id="srb-211" onclick="srBranch('211')">
        <div class="sr-mm-icon">🧬</div>
        <div class="sr-mm-label">Destruição de Cadáver</div>
        <div class="sr-mm-arts">Art. 211</div>
      </div>
      <div class="sr-mm-branch" id="srb-212" onclick="srBranch('212')">
        <div class="sr-mm-icon">🚫</div>
        <div class="sr-mm-label">Vilipêndio a Cadáver</div>
        <div class="sr-mm-arts">Art. 212</div>
      </div>
    </div>

    <div class="sr-mm-detail" id="srd-208">
      <h3>Art. 208 — Ultraje a Culto Religioso</h3>
      <ul>
        <li><strong>Bem jurídico:</strong> sentimento religioso; liberdade de crença (CF art. 5º, VI)</li>
        <li><strong>Sujeito ativo:</strong> qualquer pessoa (crime comum)</li>
        <li><strong>Sujeito passivo:</strong> pessoa crente da religião escarnecida / comunidade religiosa</li>
        <li><strong>Elemento subjetivo:</strong> dolo direto — consciência da motivação religiosa</li>
        <li><strong>Condutas:</strong> escarnecer (ridicularizar) · impedir/perturbar culto · vilipendiar ato ou objeto sagrado</li>
        <li><strong>Publicidade:</strong> requisito expresso — conduta deve ser pública</li>
      </ul>
      <div class="sr-mm-note"><strong>Atenção:</strong> A crítica religiosa — mesmo severa — não configura o tipo. Exige-se escárnio (zombaria pública com dolo de menosprezar a crença alheia). Parágrafo único: violência aumenta a pena em 1/3.</div>
    </div>

    <div class="sr-mm-detail" id="srd-209">
      <h3>Art. 209 — Impedimento ou Perturbação de Cerimônia Funerária</h3>
      <ul>
        <li><strong>Bem jurídico:</strong> respeito aos mortos; sentimento dos familiares e enlutados</li>
        <li><strong>Sujeito ativo:</strong> qualquer pessoa (crime comum)</li>
        <li><strong>Sujeito passivo:</strong> familiares e participantes da cerimônia</li>
        <li><strong>Elemento subjetivo:</strong> dolo — não exige motivação religiosa</li>
        <li><strong>Condutas:</strong> impedir (obstar a realização) · perturbar (atrapalhar sem obstar)</li>
      </ul>
      <div class="sr-mm-note"><strong>Parágrafo único:</strong> Violência aumenta a pena em 1/3, sem prejuízo da pena correspondente à violência praticada (concurso material).</div>
    </div>

    <div class="sr-mm-detail" id="srd-210">
      <h3>Art. 210 — Violação de Sepultura</h3>
      <ul>
        <li><strong>Bem jurídico:</strong> respeito à memória dos mortos; sentimento dos familiares</li>
        <li><strong>Sujeito ativo:</strong> qualquer pessoa (crime comum)</li>
        <li><strong>Elemento subjetivo:</strong> dolo — <strong>não existe modalidade culposa</strong></li>
        <li><strong>Sepultura:</strong> cova + túmulo + ornamentos + inscrições + objetos ligados permanentemente ao local</li>
        <li><strong>Urna funerária:</strong> equiparada expressamente à sepultura</li>
        <li><strong>Pena:</strong> reclusão 1–3 anos e multa (mais grave que o Art. 209)</li>
      </ul>
      <div class="sr-mm-note"><strong>Ponto de prova:</strong> "Existe forma culposa no Art. 210?" → <strong>Não.</strong> Só responde quem age dolosamente.</div>
    </div>

    <div class="sr-mm-detail" id="srd-211">
      <h3>Art. 211 — Destruição, Subtração ou Ocultação de Cadáver</h3>
      <ul>
        <li><strong>Bem jurídico:</strong> respeito aos mortos; dignidade post mortem</li>
        <li><strong>Sujeito ativo:</strong> qualquer pessoa (crime comum)</li>
        <li><strong>Elemento subjetivo:</strong> dolo</li>
        <li><strong>Condutas:</strong> destruir · subtrair · ocultar — cadáver ou <em>parte</em> dele</li>
        <li><strong>Partes protegidas (Rogério Sanches):</strong> separadas em razão das circunstâncias da morte (ex.: explosão) ou retiradas do corpo após a morte</li>
        <li><strong>Não protegidas:</strong> partes amputadas de corpo vivo — o dispositivo tutela o respeito aos mortos, não ao vivo</li>
      </ul>
    </div>

    <div class="sr-mm-detail" id="srd-212">
      <h3>Art. 212 — Vilipêndio a Cadáver</h3>
      <ul>
        <li><strong>Bem jurídico:</strong> respeito à memória e dignidade dos mortos</li>
        <li><strong>Sujeito ativo:</strong> qualquer pessoa (crime comum)</li>
        <li><strong>Elemento subjetivo:</strong> dolo — consciência de estar vilipendando</li>
        <li><strong>Vilipendiar:</strong> tratar como vil, menoscabar, ultrajar por atos, palavras ou escritos</li>
        <li><strong>Execução livre:</strong> qualquer meio (atos físicos, palavras, escritos)</li>
        <li><strong>Requisito:</strong> ação realizada <em>sobre ou junto</em> ao cadáver ou suas cinzas</li>
      </ul>
      <div class="sr-mm-note"><strong>Distinção Art. 211 × 212:</strong> Art. 211 = eliminar ou esconder o cadáver. Art. 212 = ultrajar o cadáver sem destruí-lo ou subtraí-lo.</div>
    </div>

    <p style="color:var(--text2);font-size:12px;margin-top:8px;font-family:var(--sans)">Clique em um ramo para ver os detalhes.</p>
  </div>
```

- [ ] **Step 2: Verificar no browser**

Navegar até aba Mapa Mental. Clicar em cada um dos 5 ramos. Confirmar que o painel de detalhes aparece e o ramo fica com borda roxa.

- [ ] **Step 3: Commit**

```bash
git add conteudo/penal/penal-iv/03-sentimento-religioso.html
git commit -m "feat(penal-iv): aba Mapa Mental interativo Arts. 208-212"
```

---

## Task 5: Aba 3 — Roteiro de Estudo

**Files:**
- Modify: `conteudo/penal/penal-iv/03-sentimento-religioso.html` (substituir `<!-- Task 5 -->` dentro de `#sr-roteiro`)

- [ ] **Step 1: Substituir o placeholder `<!-- Task 5 -->` pelo HTML abaixo**

```html
  <div class="sr-rot-intro">
    <h3>Roteiro de Estudo — Crimes contra o Sentimento Religioso</h3>
    <p>Arts. 208–212 do Código Penal. Siga os blocos na ordem: comece pelo bem jurídico geral, depois estude os crimes contra culto vivo, cerimônias fúnebres e, por fim, os crimes contra o cadáver.</p>
    <div class="sr-rot-tags">
      <span class="sr-rot-tag">Art. 208 CP</span>
      <span class="sr-rot-tag">Art. 209 CP</span>
      <span class="sr-rot-tag">Art. 210 CP</span>
      <span class="sr-rot-tag">Art. 211 CP</span>
      <span class="sr-rot-tag">Art. 212 CP</span>
      <span class="sr-rot-tag">CF art. 5º, VI</span>
      <span class="sr-rot-tag">Rogério Sanches</span>
    </div>
  </div>

  <!-- BLOCO 1 -->
  <div class="sr-unit">
    <div class="sr-unit-hd" onclick="srUnit(this)">
      <div class="sr-unit-num">1</div>
      <div class="sr-unit-title">Bem Jurídico do Capítulo</div>
      <div class="sr-unit-tog">▾</div>
    </div>
    <div class="sr-unit-body">

      <div class="sr-step">
        <div class="sr-step-hd" onclick="srStep(this)">
          <div class="sr-step-chk"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div>
            <div class="sr-step-title">Sentimento religioso e respeito aos mortos</div>
            <div class="sr-step-meta">Base constitucional · estrutura do capítulo</div>
          </div>
          <div class="sr-step-exp">›</div>
        </div>
        <div class="sr-step-body">
          <p>O Capítulo I do Título V CP ("Dos Crimes contra o Sentimento Religioso e contra o Respeito aos Mortos") tutela dois bens jurídicos distintos, mas reunidos sob o mesmo título:</p>
          <ul>
            <li><strong>Sentimento religioso</strong> (Arts. 208–209): liberdade de crença e de culto, garantida pela CF art. 5º, VI</li>
            <li><strong>Respeito aos mortos</strong> (Arts. 210–212): dignidade post mortem, sentimento dos familiares, memória do falecido</li>
          </ul>
          <div class="sr-art-box">CF, art. 5º, VI — é inviolável a liberdade de consciência e de crença, sendo assegurado o livre exercício dos cultos religiosos e garantida, na forma da lei, a proteção aos locais de culto e a suas liturgias.</div>
          <p>Note que o Capítulo abrange tanto a religião dos vivos quanto o respeito simbólico à morte — duas esferas distintas protegidas pelo mesmo ramo.</p>
        </div>
      </div>

    </div>
  </div>

  <!-- BLOCO 2 -->
  <div class="sr-unit">
    <div class="sr-unit-hd" onclick="srUnit(this)">
      <div class="sr-unit-num">2</div>
      <div class="sr-unit-title">Art. 208 — Ultraje a Culto Religioso</div>
      <div class="sr-unit-tog">▾</div>
    </div>
    <div class="sr-unit-body">

      <div class="sr-step">
        <div class="sr-step-hd" onclick="srStep(this)">
          <div class="sr-step-chk"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div>
            <div class="sr-step-title">Três condutas alternativas do caput</div>
            <div class="sr-step-meta">Escarnecer · Impedir/Perturbar · Vilipendiar</div>
          </div>
          <div class="sr-step-exp">›</div>
        </div>
        <div class="sr-step-body">
          <div class="sr-art-box">Art. 208 — Escarnecer de alguém publicamente, por motivo de crença ou função religiosa; impedir ou perturbar cerimônia ou prática de culto religioso; vilipendiar publicamente ato ou objeto de culto religioso: Pena — detenção, de um mês a um ano, ou multa.</div>
          <p>As três condutas são alternativas — basta praticar uma para consumar o crime:</p>
          <ul>
            <li><strong>Escarnecer:</strong> zombar, ridicularizar pessoa por sua crença ou função religiosa — exige <em>publicidade</em> e motivação religiosa</li>
            <li><strong>Impedir ou perturbar:</strong> obstar ou atrapalhar cerimônia ou prática de culto — não exige publicidade expressamente, mas o contexto público é implícito</li>
            <li><strong>Vilipendiar ato ou objeto:</strong> ultrajar publicamente ato litúrgico ou objeto de culto (ex.: hóstia, imagem sagrada)</li>
          </ul>
        </div>
      </div>

      <div class="sr-step">
        <div class="sr-step-hd" onclick="srStep(this)">
          <div class="sr-step-chk"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div>
            <div class="sr-step-title">Requisito de publicidade e distinção com crítica legítima</div>
            <div class="sr-step-meta">Ponto de prova frequente</div>
          </div>
          <div class="sr-step-exp">›</div>
        </div>
        <div class="sr-step-body">
          <div class="sr-warn-box"><strong>Atenção:</strong> "Precisa ser pública e contra os crentes daquela religião" (Prof. Artur Vieira, slides). Conduta reservada, feita em ambiente privado, não configura o tipo.</div>
          <p>A liberdade de expressão garante a crítica religiosa, inclusive severa. O que o Art. 208 veda é o <em>escárnio</em> — zombaria que tem por finalidade menosprezar a crença alheia. A linha divisória é o dolo: criticar ≠ escarnecer.</p>
          <div class="sr-ok-box"><strong>Parágrafo único:</strong> Se há emprego de violência, a pena é aumentada de um terço, sem prejuízo da correspondente à violência (concurso material).</div>
        </div>
      </div>

    </div>
  </div>

  <!-- BLOCO 3 -->
  <div class="sr-unit">
    <div class="sr-unit-hd" onclick="srUnit(this)">
      <div class="sr-unit-num">3</div>
      <div class="sr-unit-title">Arts. 209–210 — Cerimônias Fúnebres e Sepultura</div>
      <div class="sr-unit-tog">▾</div>
    </div>
    <div class="sr-unit-body">

      <div class="sr-step">
        <div class="sr-step-hd" onclick="srStep(this)">
          <div class="sr-step-chk"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div>
            <div class="sr-step-title">Art. 209 — Crime comum, sem motivação religiosa exigida</div>
            <div class="sr-step-meta">Impedir ou perturbar enterro ou cerimônia funerária</div>
          </div>
          <div class="sr-step-exp">›</div>
        </div>
        <div class="sr-step-body">
          <div class="sr-art-box">Art. 209 — Impedir ou perturbar enterro ou cerimônia funerária: Pena — detenção, de um mês a um ano, ou multa. Parágrafo único — Se há emprego de violência, a pena é aumentada de um terço, sem prejuízo da correspondente à violência.</div>
          <p>Diferente do Art. 208, o Art. 209 <strong>não exige motivação religiosa</strong> — protege o ato fúnebre em si, independentemente da crença dos presentes. É crime comum: qualquer pessoa pode ser sujeito ativo.</p>
          <div class="sr-ok-box"><strong>Crime comum:</strong> sujeito ativo pode ser qualquer pessoa, incluindo familiares do próprio falecido.</div>
        </div>
      </div>

      <div class="sr-step">
        <div class="sr-step-hd" onclick="srStep(this)">
          <div class="sr-step-chk"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div>
            <div class="sr-step-title">Art. 210 — Conceito amplo de sepultura e ausência de forma culposa</div>
            <div class="sr-step-meta">Ponto de prova: não existe Art. 210 culposo</div>
          </div>
          <div class="sr-step-exp">›</div>
        </div>
        <div class="sr-step-body">
          <div class="sr-art-box">Art. 210 — Violar ou profanar sepultura ou urna funerária: Pena — reclusão, de um a três anos, e multa.</div>
          <p>A <strong>sepultura</strong> abrange não apenas a cova, mas todo o lugar onde o cadáver está enterrado — compreende o túmulo (construção acima da cova), os ornamentos, inscrições e objetos ligados permanentemente ao local.</p>
          <div class="sr-warn-box"><strong>Não existe modalidade culposa:</strong> o CP não prevê "violação culposa de sepultura". Quem viola sem dolo não responde pelo Art. 210.</div>
        </div>
      </div>

    </div>
  </div>

  <!-- BLOCO 4 -->
  <div class="sr-unit">
    <div class="sr-unit-hd" onclick="srUnit(this)">
      <div class="sr-unit-num">4</div>
      <div class="sr-unit-title">Arts. 211–212 — Crimes contra o Cadáver</div>
      <div class="sr-unit-tog">▾</div>
    </div>
    <div class="sr-unit-body">

      <div class="sr-step">
        <div class="sr-step-hd" onclick="srStep(this)">
          <div class="sr-step-chk"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div>
            <div class="sr-step-title">Art. 211 — Partes do cadáver protegidas (Rogério Sanches)</div>
            <div class="sr-step-meta">Distinção: partes de morto × partes de vivo</div>
          </div>
          <div class="sr-step-exp">›</div>
        </div>
        <div class="sr-step-body">
          <div class="sr-art-box">Art. 211 — Destruir, subtrair ou ocultar cadáver ou parte dele: Pena — reclusão, de um a três anos, e multa.</div>
          <div class="sr-doc-box"><strong>Rogério Sanches:</strong> As partes do corpo do cadáver a que se refere o dispositivo são aquelas separadas em razão das circunstâncias da morte (como a explosão), bem como as retiradas do corpo humano após a morte. Deve-se atentar para o fato de que as partes amputadas de um corpo vivo não são protegidas pelo dispositivo em apreço, que trata da tutela do respeito aos mortos.</div>
          <p>Em resumo: a tutela do Art. 211 pressupõe que a pessoa já esteja morta. Partes separadas de corpo vivo (amputação cirúrgica, por exemplo) estão fora do tipo.</p>
        </div>
      </div>

      <div class="sr-step">
        <div class="sr-step-hd" onclick="srStep(this)">
          <div class="sr-step-chk"><svg viewBox="0 0 12 12" fill="none"><polyline points="2,6 5,9 10,3" stroke="#fff" stroke-width="2" stroke-linecap="round"/></svg></div>
          <div>
            <div class="sr-step-title">Art. 212 — Vilipêndio como crime de execução livre</div>
            <div class="sr-step-meta">Qualquer meio · exige contato com o cadáver ou cinzas</div>
          </div>
          <div class="sr-step-exp">›</div>
        </div>
        <div class="sr-step-body">
          <div class="sr-art-box">Art. 212 — Vilipendiar cadáver ou suas cinzas: Pena — detenção, de um a três anos, e multa.</div>
          <p><strong>Vilipendiar</strong> = tratar como vil, menoscabar, desprezar, ultrajar por meio de atos, palavras ou escritos.</p>
          <div class="sr-ok-box"><strong>Execução livre:</strong> o tipo não define o meio — basta que a ação ultrajante seja realizada sobre ou junto ao cadáver ou suas cinzas.</div>
          <div class="sr-warn-box"><strong>Distinção Art. 211 × 212:</strong> Art. 211 elimina ou esconde o cadáver. Art. 212 ultraja o cadáver sem destruí-lo ou subtraí-lo. Condutas não se confundem.</div>
        </div>
      </div>

    </div>
  </div>
```

- [ ] **Step 2: Verificar no browser**

Navegar até aba Roteiro. Clicar nos 4 blocos numerados. Confirmar que expandem e mostram os steps com checkbox e botão de expansão.

- [ ] **Step 3: Commit**

```bash
git add conteudo/penal/penal-iv/03-sentimento-religioso.html
git commit -m "feat(penal-iv): aba Roteiro de Estudo 4 blocos Arts. 208-212"
```

---

## Task 6: Aba 4 — Estudo de Caso

**Files:**
- Modify: `conteudo/penal/penal-iv/03-sentimento-religioso.html` (substituir `<!-- Task 6 -->` dentro de `#sr-caso`)

- [ ] **Step 1: Substituir o placeholder `<!-- Task 6 -->` pelo HTML abaixo**

```html
  <div class="sr-ec-header">
    <div class="sr-ec-op">Estudo de Caso · Direito Penal IV</div>
    <h3>Crimes contra o Sentimento Religioso</h3>
    <p>Três casos práticos para aplicar os Arts. 208–212 CP. Leia o enunciado, reflita e expanda para ver a análise.</p>
    <div class="sr-ec-meta">
      <span class="sr-ec-tag">Art. 208</span>
      <span class="sr-ec-tag">Art. 209</span>
      <span class="sr-ec-tag">Art. 211 × 212</span>
      <span class="sr-ec-tag">Liberdade de expressão</span>
    </div>
  </div>

  <div class="sr-q-list">

    <div class="sr-q-item">
      <div class="sr-q-hd" onclick="srToggle(this)">
        <div class="sr-q-num">A</div>
        <div>
          <div class="sr-q-text">Durante culto transmitido ao vivo para 50 mil espectadores, um pastor exibe imagens de ritual de candomblé e afirma, de forma jocosa: "isso é macumba, é coisa do diabo, quem faz isso é ignorante". Configura o Art. 208?</div>
          <div class="sr-q-meta">Art. 208 · publicidade · escárnio × crítica religiosa · liberdade de expressão</div>
        </div>
        <div class="sr-q-arr">▾</div>
      </div>
      <div class="sr-q-body">
        <p><strong>Análise:</strong> O caso envolve tensão entre a liberdade religiosa (Art. 5º, VI CF) e a liberdade de expressão (Art. 5º, IV CF). Para configurar o Art. 208, é necessário:</p>
        <ul>
          <li><strong>Publicidade:</strong> presente — transmissão ao vivo para 50 mil pessoas</li>
          <li><strong>Motivação religiosa:</strong> presente — a crítica recai diretamente sobre o ritual de candomblé</li>
          <li><strong>Escarnecer de alguém:</strong> aqui está o nó central — o tipo exige que o escárnio recaia sobre <em>pessoa</em> por motivo de crença ou função religiosa</li>
        </ul>
        <p>Se o pastor zomba das pessoas que praticam o candomblé ("quem faz isso é ignorante"), atinge diretamente os <em>crentes</em> — preenche o tipo. Se critica apenas o ritual em abstrato, sem dirigir o escárnio aos crentes, aproxima-se mais da crítica religiosa legítima.</p>
        <p>Adicionalmente, "vilipendiar publicamente ato ou objeto de culto religioso" (2ª conduta alternativa do Art. 208) pode ser preenchida se a exibição jocosa das imagens tiver por finalidade ultrajar o ato litúrgico do candomblé.</p>
        <div class="sr-art-box">Conclusão provável: configura ao menos a conduta de vilipendiar publicamente ato de culto religioso (Art. 208, 3ª parte). A 1ª conduta (escarnecer de alguém) depende da análise do dolo e de a quem o escárnio foi dirigido.</div>
      </div>
    </div>

    <div class="sr-q-item">
      <div class="sr-q-hd" onclick="srToggle(this)">
        <div class="sr-q-num">B</div>
        <div>
          <div class="sr-q-text">Grupo de manifestantes interrompe o cortejo fúnebre de um político, bloqueando o carro fúnebre com seus corpos e gritando palavras de ordem. Qual a tipificação? E se utilizarem empurrões para manter o bloqueio?</div>
          <div class="sr-q-meta">Art. 209 · impedir vs. perturbar · parágrafo único · concurso material</div>
        </div>
        <div class="sr-q-arr">▾</div>
      </div>
      <div class="sr-q-body">
        <p><strong>Análise:</strong> O cortejo fúnebre é "cerimônia funerária" para fins do Art. 209. O bloqueio físico do carro fúnebre configura <strong>impedir</strong> (obstar a realização do ato), não apenas perturbar.</p>
        <ul>
          <li><strong>Sujeito ativo:</strong> crime comum — qualquer pessoa, mesmo com motivação política (Art. 209 não exige motivação religiosa)</li>
          <li><strong>Conduta:</strong> impedir enterro ou cerimônia funerária — consumado com o bloqueio efetivo</li>
          <li><strong>Pena base:</strong> detenção de 1 mês a 1 ano, ou multa</li>
        </ul>
        <p>Se utilizarem empurrões (violência), incide o <strong>parágrafo único do Art. 209</strong>: pena aumentada de um terço, sem prejuízo da correspondente à violência praticada — ou seja, concurso material com lesão corporal ou vias de fato, conforme o resultado.</p>
        <div class="sr-art-box">Conclusão: Art. 209 caput (impedir cerimônia funerária). Com empurrões: Art. 209 parágrafo único + lesão corporal/vias de fato em concurso material.</div>
      </div>
    </div>

    <div class="sr-q-item">
      <div class="sr-q-hd" onclick="srToggle(this)">
        <div class="sr-q-num">C</div>
        <div>
          <div class="sr-q-text">Médico legista, após autópsia autorizada, descarta indevidamente órgão retirado do cadáver jogando-o no lixo hospitalar comum. Em outra situação, um funcionário do IML fotografa o cadáver em pose ridicularizante e posta nas redes sociais. Qual crime em cada caso?</div>
          <div class="sr-q-meta">Art. 211 × Art. 212 · partes do cadáver · vilipêndio · execução livre</div>
        </div>
        <div class="sr-q-arr">▾</div>
      </div>
      <div class="sr-q-body">
        <p><strong>Caso 1 — Descarte do órgão:</strong></p>
        <ul>
          <li>Órgão retirado após a morte = parte do cadáver protegida pelo Art. 211 (Rogério Sanches: "partes retiradas do corpo humano após a morte")</li>
          <li>Conduta: <strong>destruir</strong> parte do cadáver ao descartá-la indevidamente</li>
          <li>Tipificação: <strong>Art. 211</strong> — reclusão 1–3 anos e multa</li>
          <li>A autorização para a autópsia não autoriza o descarte irregular — o consentimento é para o ato médico, não para a eliminação da parte</li>
        </ul>
        <p><strong>Caso 2 — Fotografia ridicularizante:</strong></p>
        <ul>
          <li>Conduta: ultrajar o cadáver por meio de fotografia em pose ridícula e publicação — trata o morto como vil</li>
          <li>Execução livre: a fotografia e a postagem são meios de vilipêndio</li>
          <li>Exige-se que a ação seja realizada <em>sobre ou junto</em> ao cadáver — a foto foi feita no IML, junto ao cadáver: requisito preenchido</li>
          <li>Tipificação: <strong>Art. 212</strong> — detenção 1–3 anos e multa</li>
        </ul>
        <div class="sr-art-box">Conclusão: Caso 1 → Art. 211 (destruir parte do cadáver). Caso 2 → Art. 212 (vilipêndio a cadáver). Os crimes não se confundem: Art. 211 elimina/esconde; Art. 212 ultraja sem eliminar.</div>
      </div>
    </div>

  </div>
```

- [ ] **Step 2: Verificar no browser**

Navegar até aba Estudo de Caso. Clicar nos 3 itens. Confirmar que expandem e mostram análise completa com boxes coloridos.

- [ ] **Step 3: Commit**

```bash
git add conteudo/penal/penal-iv/03-sentimento-religioso.html
git commit -m "feat(penal-iv): aba Estudo de Caso 3 questões Arts. 208-212"
```

---

## Task 7: JavaScript — srTab, srBranch, srUnit, srStep, srToggle

**Files:**
- Modify: `conteudo/penal/penal-iv/03-sentimento-religioso.html` (substituir o IIFE vazio `// Task 7 — JavaScript` dentro do `<script>`)

- [ ] **Step 1: Substituir `// Task 7 — JavaScript` pelo código abaixo**

```js
  /* ── Abas ── */
  window.srTab = function(id, btn) {
    const wrap = btn.closest('.sr-tabs').parentElement
    wrap.querySelectorAll('.sr-painel').forEach(p => p.classList.remove('ativo'))
    wrap.querySelectorAll('.sr-tab').forEach(b => b.classList.remove('ativo'))
    wrap.querySelector('#sr-' + id).classList.add('ativo')
    btn.classList.add('ativo')
  }

  /* ── Mapa Mental ── */
  const srData = ['208','209','210','211','212']
  window.srBranch = function(key) {
    srData.forEach(k => {
      const b = document.getElementById('srb-' + k)
      const d = document.getElementById('srd-' + k)
      if (b) b.classList.remove('ativo')
      if (d) d.classList.remove('ativo')
    })
    const branch = document.getElementById('srb-' + key)
    const detail = document.getElementById('srd-' + key)
    if (branch) branch.classList.add('ativo')
    if (detail) detail.classList.add('ativo')
    if (detail) detail.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
  }

  /* ── Roteiro: unidades (blocos) ── */
  window.srUnit = function(hd) {
    const body = hd.nextElementSibling
    const tog  = hd.querySelector('.sr-unit-tog')
    const open = body.classList.contains('aberto')
    body.classList.toggle('aberto', !open)
    tog.classList.toggle('aberto', !open)
  }

  /* ── Roteiro: steps (checkboxes) ── */
  window.srStep = function(hd) {
    const step = hd.parentElement
    const body = hd.nextElementSibling
    const exp  = hd.querySelector('.sr-step-exp')
    const bodyOpen = body.classList.contains('aberto')
    body.classList.toggle('aberto', !bodyOpen)
    if (exp) exp.style.transform = bodyOpen ? '' : 'rotate(90deg)'
    if (!bodyOpen) {
      step.classList.toggle('feito', step.classList.contains('feito') ? false : false)
    }
  }

  /* ── Estudo de Caso: acordeão ── */
  window.srToggle = function(hd) {
    const body = hd.nextElementSibling
    const arr  = hd.querySelector('.sr-q-arr')
    const open = body.classList.contains('aberto')
    body.classList.toggle('aberto', !open)
    if (arr) arr.classList.toggle('aberto', !open)
  }
```

- [ ] **Step 2: Verificar todas as interações no browser**

Testar em sequência:
1. Clicar nas 4 abas — cada uma deve ativar o painel correto
2. Clicar nos 5 ramos do Mapa Mental — painel de detalhes deve aparecer com borda roxa
3. Clicar nos 4 blocos do Roteiro — devem abrir/fechar
4. Clicar nos steps internos do Roteiro — devem expandir a explicação
5. Clicar nas 3 questões do Estudo de Caso — devem abrir/fechar com seta girando

- [ ] **Step 3: Commit**

```bash
git add conteudo/penal/penal-iv/03-sentimento-religioso.html
git commit -m "feat(penal-iv): JavaScript srTab srBranch srUnit srStep srToggle"
```

---

## Task 8: Push final e verificação no GitHub Pages

**Files:** nenhum arquivo novo

- [ ] **Step 1: Verificar status do repositório**

```bash
git status
git log --oneline -8
```

Esperado: working tree limpa; ver os commits das Tasks 1–7.

- [ ] **Step 2: Push para GitHub Pages**

```bash
git push
```

- [ ] **Step 3: Verificar no GitHub Pages**

Abrir o site no browser (GitHub Pages URL do projeto). Navegar até Penal IV → novo card "Unidade 3 — Crimes contra o Sentimento Religioso". Confirmar que todas as 4 abas funcionam corretamente.
