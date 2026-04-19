# Download de Imagem Individual — Plano de Implementação

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Injetar um botão "⬇ Baixar imagem" abaixo de cada infográfico/mapa mental nos temas, usando o atributo HTML5 `download` para download nativo sem dependências.

**Architecture:** `app.js` detecta, após o carregamento de cada tema, todos os `<a href="*.png">` que contêm `<img>` e injeta `.img-download-wrap` como último filho do container pai. `style.css` recebe os estilos do botão.

**Tech Stack:** HTML/CSS/JS vanilla, GitHub Pages.

---

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `style.css` | Adicionar `.img-download-wrap` e `.btn-download-img` após `.btn-download-pdf:hover` |
| `app.js` | Adicionar bloco de injeção em `abrirTema`, após o bloco de âncoras internas (linha ~633), antes do bloco `// Cabeçalho de identidade` |

---

## Task 1 — CSS: estilo do botão de download de imagem

**Files:**
- Modify: `style.css`

- [ ] **Step 1: Localizar o ponto de inserção**

No `style.css`, localizar:
```css
.btn-download-pdf:hover { background: #b8943f; }
```

- [ ] **Step 2: Adicionar os estilos logo após**

```css
/* Botão de download de imagem individual */
.img-download-wrap {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid var(--border);
  margin-top: 8px;
}

.btn-download-img {
  background: var(--gold);
  color: white;
  border-radius: 6px;
  padding: 6px 14px;
  font-size: 12px;
  font-weight: 600;
  font-family: var(--sans);
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  transition: background .2s;
}

.btn-download-img:hover { background: #b8943f; }
```

- [ ] **Step 3: Commit**

```bash
git add style.css
git commit -m "feat(pdf): adiciona estilos do botão de download de imagem"
```

---

## Task 2 — JS: injetar botão em cada imagem de `abrirTema`

**Files:**
- Modify: `app.js`

- [ ] **Step 1: Localizar o ponto de inserção**

Em `app.js`, dentro de `abrirTema`, localizar este bloco (linha ~619-633):

```js
      // Âncoras internas (#seção): scroll suave sem alterar hash da URL
      // (evita que o popstate interprete o estado como nulo e volte à tela inicial)
      area.querySelectorAll('a[href^="#"]').forEach(a => {
        a.addEventListener('click', e => {
          e.preventDefault()
          const id = a.getAttribute('href').slice(1)
          const target = document.getElementById(id)
          if (target) {
            const headerH = document.querySelector('header')?.offsetHeight ?? 0
            const top = target.getBoundingClientRect().top + window.scrollY - headerH - 12
            const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
            window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
          }
        })
      })
      // Cabeçalho de identidade para impressão (oculto na tela)
```

- [ ] **Step 2: Adicionar o bloco de injeção entre as duas seções**

Substituir:
```js
      })
      // Cabeçalho de identidade para impressão (oculto na tela)
```

Por:
```js
      })
      // Botão de download para imagens (infográficos, mapas mentais)
      area.querySelectorAll('a[href]').forEach(link => {
        const href = link.getAttribute('href')
        if (!href || !/\.(png|jpg|jpeg|webp|gif)$/i.test(href)) return
        if (!link.querySelector('img')) return

        const filename = href.split('/').pop()
        const wrap = document.createElement('div')
        wrap.className = 'img-download-wrap'
        wrap.innerHTML = `
          <a class="btn-download-img" href="${href}" download="${esc(filename)}">
            ⬇ Baixar imagem
          </a>
        `
        link.parentElement.appendChild(wrap)
      })
      // Cabeçalho de identidade para impressão (oculto na tela)
```

- [ ] **Step 3: Verificar**

Confirmar que `grep -n "img-download\|btn-download-img" app.js` retorna pelo menos 3 ocorrências.

- [ ] **Step 4: Commit**

```bash
git add app.js
git commit -m "feat(pdf): injeta botão de download em imagens de temas"
```

---

## Self-Review

### Cobertura da spec
- [x] JS injection em `app.js` — Task 2
- [x] Posição abaixo da legenda, alinhado à direita — `.img-download-wrap { justify-content: flex-end }` + `appendChild` (depois da `<p>` legenda)
- [x] Mesmo dourado (`--gold`) — Task 1
- [x] `<a download>` nativo — Task 2 Step 2
- [x] Sem tocar arquivos de conteúdo — ✓
- [x] `esc(filename)` no atributo `download` — Task 2 Step 2
- [x] `prefers-reduced-motion` desnecessário (só `transition: background`) — ✓

### Placeholder scan
Nenhum TBD ou passo sem código.

### Consistência de nomes
`.img-download-wrap` e `.btn-download-img` usados consistentemente em Task 1 e Task 2.
