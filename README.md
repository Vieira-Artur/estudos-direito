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

## Estrutura de dados (`data.js`)

Cada tema segue este formato:
```js
{
  titulo: "Nome do Tema",
  descricao: "Breve descrição do conteúdo",
  arquivo: "conteudo/materia/turma/nome-do-arquivo.html"
}
```
