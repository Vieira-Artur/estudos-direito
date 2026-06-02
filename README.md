# Estudos Complementares — Direito

Site estático hospedado no GitHub Pages para alunos de graduação.

## Como adicionar conteúdo

1. Crie o arquivo HTML do conteúdo em `conteudo/<materia>/<turma>/<tema>.html`
2. Abra `data.js` e adicione a entrada correspondente no array `temas` da turma correta
3. Faça commit e push — o site atualiza automaticamente

## Atualizar sitemap

Sempre que adicionar matérias ou temas em `data.js`, regenere o `sitemap.xml`:

```bash
node scripts/gerar-sitemap.js
```

O arquivo `sitemap.xml` gerado deve ser commitado junto com as alterações em `data.js`.

## Otimizar imagens (AVIF/WebP)

Os infográficos em `conteudo/` são servidos como `<picture>` com AVIF e WebP para reduzir o
payload de rede. Sempre que adicionar um novo PNG em `conteudo/`, execute:

```bash
npm install          # apenas na primeira vez (instala sharp)
npm run otimizar-imagens   # gera .avif e .webp ao lado de cada .png
npm run atualizar-html     # atualiza os <img> para <picture> nos HTMLs
```

Ambos os scripts são **idempotentes** — pulam arquivos cujo derivado já é mais novo que o PNG.
Comite os arquivos `.avif`, `.webp` e os HTMLs atualizados junto com o novo PNG.

Se quiser apenas garantir `loading="lazy"`, `decoding="async"` e `width`/`height` sem converter
para AVIF/WebP (ex.: SVGs ou PNGs pequenos), use:

```bash
npm run normalizar-imagens   # normaliza atributos de <img> em conteudo/
```

## Estrutura de dados (`data.js`)

Cada tema segue este formato:
```js
{
  titulo: "Nome do Tema",
  descricao: "Breve descrição do conteúdo",
  arquivo: "conteudo/materia/turma/nome-do-arquivo.html"
}
```
