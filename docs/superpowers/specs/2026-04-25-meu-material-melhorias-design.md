# Spec: Melhorias no Meu Material (legenda, reordenação, PDF)

**Data:** 2026-04-25
**Status:** Aprovado

## Objetivo

Adicionar três melhorias ao painel "Meu Material" em `meu-espaco.js`:
1. **Legenda** por item — texto editável exibido abaixo do thumbnail
2. **Reordenação** — botões ↑↓ para mover itens na galeria
3. **PDF** — aceitar arquivos PDF além de imagens

---

## Modelo de dados

### Antes
```js
{ id, arquivo, nome, dataUrl }
```

### Depois
```js
{ id, arquivo, nome, dataUrl, type, caption, order }
```

| Campo | Tipo | Descrição |
|---|---|---|
| `type` | `'image' \| 'pdf'` | Tipo de arquivo |
| `caption` | `string` | Legenda opcional (padrão `''`) |
| `order` | `number` | Número usado para ordenação (padrão = `Date.now()` no momento do upload) |

### Migração de itens existentes
Itens já armazenados sem os novos campos recebem defaults ao carregar:
- `type`: inferido da extensão do nome (`.pdf` → `'pdf'`, qualquer outra coisa → `'image'`)
- `caption`: `''`
- `order`: índice na array × 1000 (preserva ordem de inserção)

A migração ocorre na função `getAll` do `MaterialDB`, não no código de init.

---

## Feature 1: Legenda

- Exibida abaixo do thumbnail como `<input type="text">` com placeholder "Adicionar legenda..."
- Editável diretamente na galeria
- Salva no IndexedDB no evento `blur` do input
- Sem legenda definida: input vazio, placeholder visível

---

## Feature 2: Reordenação

- Dois botões `↑` e `↓` na área de ações de cada item
- `↑`: troca o `order` do item com o item anterior na lista renderizada. Desabilitado no primeiro item.
- `↓`: troca o `order` do item com o item seguinte. Desabilitado no último item.
- Após troca: salva ambos os itens no IndexedDB e re-renderiza a galeria
- A galeria sempre é renderizada ordenada por `order` crescente

---

## Feature 3: PDF

### Upload
- Input aceita `accept="image/*,application/pdf"`
- Se `file.type === 'application/pdf'`: lê como dataUrl com `FileReader.readAsDataURL`, armazena diretamente (sem compressão)
- Se imagem: compressão JPEG 1200px existente (sem mudança)

### Thumbnail na galeria
- Imagens: `<img>` como antes
- PDFs: div com ícone e nome do arquivo:
  ```html
  <div class="me-pdf-thumb">
    <span class="me-pdf-icone">📄</span>
    <span class="me-pdf-nome">arquivo.pdf</span>
  </div>
  ```

### Visualização
- Imagens: lightbox existente (sem mudança)
- PDFs: converte dataUrl em Blob URL e abre em nova aba via `window.open(blobUrl)`

---

## Mudanças de código

**`meu-espaco.js`** — única mudança:
- `MaterialDB.getAll`: aplicar migração de campos faltantes
- `initUploadMaterial`:
  - `input.accept` → `"image/*,application/pdf"`
  - `input.addEventListener('change')`: bifurcar por tipo (PDF vs imagem)
  - `renderGaleria`: novo HTML com ícone PDF, botões ↑↓, input de legenda
  - Novos event listeners: `me-material-up`, `me-material-down`, `caption blur`
  - Nova função `abrirPdf(dataUrl)` para abrir PDF via Blob URL

**`meu-espaco.css`** — novos seletores:
- `.me-pdf-thumb`, `.me-pdf-icone`, `.me-pdf-nome`
- `.me-material-up`, `.me-material-down` (reutilizam estilo de `.me-material-ver`)
- `.me-material-caption` (input de legenda)
- Estado disabled para ↑↓ nos extremos

## Fora de escopo
- Drag-and-drop para reordenar
- Preview de páginas do PDF
- Renomear arquivo
- Exportar/baixar material
