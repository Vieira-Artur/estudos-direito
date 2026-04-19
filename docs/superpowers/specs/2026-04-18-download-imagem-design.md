# Download de Imagem Individual — Design Spec

## Objetivo

Adicionar um botão "⬇ Baixar imagem" abaixo de cada infográfico/mapa mental nos temas, permitindo que o aluno baixe a imagem isoladamente sem gerar o PDF do material completo.

## Decisões

| Questão | Decisão |
|---|---|
| Abordagem | JS injection em `app.js` — zero mudanças nos arquivos de conteúdo |
| Posição | Abaixo da legenda da imagem, alinhado à direita |
| Estilo | Mesmo dourado (`--gold`) do botão de PDF, tamanho ligeiramente menor |
| Mecanismo | `<a href="..." download="filename.png">` — download nativo do browser |
| Escopo | Todas as `<img>` dentro de `<a href="*.png|jpg|jpeg|webp|gif">` no `#conteudo-area` |

## Arquitetura

Dois arquivos alterados. Nenhum arquivo de conteúdo (`conteudo/**`) é tocado.

| Arquivo | Mudança |
|---|---|
| `app.js` | Varredura pós-fetch em `abrirTema`: detecta `<a href="*.png">` com `<img>` filho e injeta `.img-download-wrap` |
| `style.css` | Estilos de `.img-download-wrap` e `.btn-download-img` |

## Detalhes de implementação

### `app.js` — injeção em `abrirTema`

Adicionar **após** o bloco que corrige `a[href]` (e antes de `executarScripts(area)`):

```js
// Botão de download para cada imagem (infográficos, mapas mentais)
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
```

**Notas:**
- `href` já está absoluto neste ponto (corrigido pelo bloco anterior de `a[href]`)
- `esc(filename)` previne injeção no atributo `download`
- `link.parentElement.appendChild(wrap)` insere o botão como último filho do container da imagem (após a legenda `<p>`)
- O atributo `download` aciona download nativo — funciona para recursos do mesmo domínio (GitHub Pages)

### `style.css` — estilos

Adicionar logo após `.btn-download-pdf:hover`:

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

Ligeiramente menor que `.btn-download-pdf` (padding e font-size reduzidos) por estar inline no conteúdo, não no rodapé. Mesma cor dourada para consistência visual.

## Restrições

- Não modificar arquivos de conteúdo (`conteudo/**`)
- Funcionar automaticamente para imagens futuras sem intervenção
- `prefers-reduced-motion`: `transition: background .2s` é só cor — não precisa de media query adicional
- O botão de download de imagem é **adicional** ao botão de PDF do rodapé — ambos coexistem
