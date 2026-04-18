# Deep Linking com Hash — Design Spec

**Data:** 2026-04-18
**Escopo:** Solução 1 (mínima viável) — URLs reais + scroll para seção

---

## Objetivo

Permitir compartilhar links que abram diretamente um tema e rolem até uma seção específica. Exemplo:

```
/tributario/tributario-financeiro-i/01-guia-estudos#reparticao-de-receitas
```

---

## Arquitetura

### Estrutura de URL

Derivada de `tema.arquivo`, removendo prefixo `conteudo/` e extensão `.html`:

| Nível | URL | Exemplo |
|-------|-----|---------|
| Home | `/` | `/` |
| Matéria | `/{materiaId}` | `/tributario` |
| Turma | `/{materiaId}/{turmaId}` | `/tributario/tributario-financeiro-i` |
| Tema | `/{materiaId}/{turmaId}/{arquivo-slug}` | `/tributario/tributario-financeiro-i/01-guia-estudos` |
| Tema + seção | igual ao tema + `#{sectionId}` | `...#reparticao-de-receitas` |
| Sobre | `/sobre` | `/sobre` |

**Vantagem:** o routing é zero-config para novos temas — basta adicionar à `data.js` com `arquivo` correto.

### GitHub Pages — fallback de 404

Criar `404.html` como cópia exata de `index.html`. O GH Pages serve `404.html` para rotas não encontradas; o SPA recebe o HTML, lê o pathname e roteia corretamente.

---

## Mudanças em `app.js`

### 1. `replaceState` inicial

```js
// antes
history.replaceState({ view: 'materias' }, '')
renderArvore(true)

// depois: boot-routing decide o que renderizar com base na URL
history.replaceState({ view: 'materias' }, '', '/')
inicializarRota()
```

### 2. Boot-routing — `inicializarRota()`

Lê `window.location.pathname` e navega para a view correspondente:

```
/           → renderArvore(true)
/sobre      → abrirSobre(true)
/{mId}      → selecionarMateria(mId, true)
/{mId}/{tId}         → selecionarTurma(mId, tId, true)
/{mId}/{tId}/{slug}  → localiza tema por arquivo, abre + rola para hash
fallback    → renderArvore(true)
```

Para localizar o tema: itera `materias` em `data.js`, compara
`tema.arquivo.replace('conteudo/', '').replace('.html', '')` com o pathname sem a barra inicial.

### 3. `pushState` com URL real

Todas as funções de navegação ganham o terceiro argumento:

```js
// selecionarMateria
history.pushState({ view: 'materia', materiaId: id }, '', `/${id}`)

// selecionarTurma
history.pushState({ view: 'turma', materiaId, turmaId }, '', `/${materiaId}/${turmaId}`)

// abrirTema
const slug = tema.arquivo.replace('conteudo/', '').replace('.html', '')
history.pushState({ view: 'tema', ... }, '', `/${slug}`)

// abrirSobre
history.pushState({ view: 'sobre' }, '', '/sobre')
```

### 4. `rolarParaAncora()`

Chamada: após `innerHTML` do tema, no handler `popstate` para temas, e no boot-routing após abrir tema.

```js
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

### 5. `ativarTabDoElemento(el)`

Sobe o DOM buscando um painel de aba oculto (`[class*="-painel"]` sem classe `ativo`). Se encontrar, localiza o botão cujo `onclick` contém o `id` do painel e chama `.click()`.

```js
function ativarTabDoElemento(el) {
  let node = el.parentElement
  while (node && node !== document.body) {
    if (node.id && node.className.includes('-painel') && !node.classList.contains('ativo')) {
      const btn = document.querySelector(`[onclick*="${node.id}"]`)
      if (btn) btn.click()
      break
    }
    node = node.parentElement
  }
}
```

### 6. `popstate` — temas com hash

Após restaurar o tema via popstate, chamar `rolarParaAncora()`.

---

## Mudanças nos arquivos HTML de conteúdo

### Padrão de `id`

- Kebab-case, sem acentos, curto e semântico
- Único dentro do arquivo
- Adicionado ao elemento mais próximo que engloba a seção (wrapper da section-title ou o próprio div pai)

### IDs planejados por arquivo

**`tributario/tributario-financeiro-i/01-guia-estudos.html`**
- `especies-tributarias`
- `ciclo-credito`
- `modificacao-credito`
- `principios`
- `reparticao-de-receitas`
- `roteiro-unidade-1` … `roteiro-unidade-7`

**`tributario/processo-tributario/01-fazenda-publica.html`** — a mapear

**`tributario/processo-tributario/02-lancamento.html`** — a mapear

**`tributario/processo-tributario/03-execucao-fiscal.html`**
- `linha-do-tempo-lef` (a confirmar)
- `citacao`
- `embargos`
- `expropriacao`
- `redirecionamento`

**`processual-penal-ii/01-teoria-geral-provas.html`** — a mapear

**`processual-penal-ii/02-provas-em-especie.html`** — a mapear

**`processual-penal-ii/03-prisoes.html`**
- `flagrante`
- `preventiva`
- `temporaria`
- `cautelares`
- `prisao-domiciliar`
- `fianca`
- `jurisprudencia`

**`penal/penal-iv/` e `processual-penal-iii/`** — a mapear durante implementação

IDs ambíguos serão listados antes de commitar para revisão.

---

## Novo arquivo: `404.html`

Cópia de `index.html`. Permite que o GitHub Pages sirva o SPA para qualquer rota desconhecida.

---

## O que não muda

- `data.js` — intocado
- Busca, flashcards, breadcrumb, skeleton, `sobre.html`
- Handler de âncoras internas (`a[href^="#"]`) dentro dos temas
- Lógica de flashcards (localStorage)

---

## Extensibilidade

Novos temas adicionados a `data.js` com `arquivo` correto ganham URL automática, sem nenhuma mudança em `app.js`. A única etapa manual é adicionar `id` nas seções do novo arquivo HTML.

---

## Commits planejados

1. `feat(conteudo): adiciona ids estáveis nas seções dos temas`
2. `feat(app): suporta deep link com hash para ancorar seção do tema`
3. `feat: adiciona 404.html para suporte a deep links no GitHub Pages`

---

## Plano de verificação

1. Colar URL com hash no browser → abre tema e rola até seção
2. Navegar para outro tema, voltar com Alt+← → rola de novo (popstate)
3. Aba anônima + URL com hash → funciona igual
4. F5 numa URL com hash → mantém rolagem
5. Reduce Motion ativo → rolagem instantânea
6. Busca global → continua funcionando
7. DevTools Console → sem erros novos
8. `node scripts/gerar-sitemap.js` (se existir) → passa sem erros
