# Estudos Complementares — Direito

Site estático hospedado no GitHub Pages para alunos de graduação.

## Como adicionar conteúdo

1. Crie o arquivo HTML do conteúdo em `conteudo/<materia>/<turma>/<tema>.html`
2. Abra `data.js` e adicione a entrada correspondente no array `temas` da turma correta
3. Faça commit e push — o site atualiza automaticamente

## Estrutura de dados (`data.js`)

Cada tema segue este formato:
```js
{
  titulo: "Nome do Tema",
  descricao: "Breve descrição do conteúdo",
  arquivo: "conteudo/materia/turma/nome-do-arquivo.html"
}
```
