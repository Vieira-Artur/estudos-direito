# Design: Card de Jurisprudência Expansível na Home

**Data:** 2026-06-25  
**Status:** Aprovado

## Problema

A seção de Jurisprudência (informativos STJ) é o conteúdo mais dinâmico do site — atualizado toda segunda-feira. Porém, para acessá-la o aluno precisa: clicar em uma matéria → ver lista de turmas → clicar em "Jurisprudência" (3 cliques mínimos, repetidos para cada área).

## Solução

Adicionar um card "Jurisprudência" ao grid de matérias na home. Ao clicar, o card expande in-place e revela 3 links diretos: **Penal**, **Proc. Penal** e **Tributário**. Clicar em um deles navega imediatamente para o índice de informativos daquela área.

## Estrutura Visual

O card segue o visual dos `card-materia` existentes (mesma classe, mesmos tokens de cor). Contém:

- Ícone: 📋
- Título: "Jurisprudência"
- Subtítulo: "Atualizada toda segunda-feira"
- Seta ›  (vira ˅ quando expandido)

Ao expandir, três botões aparecem abaixo do cabeçalho do card:

```
[ Penal ]  [ Proc. Penal ]  [ Tributário ]
```

Alinhados em linha (flex, com quebra em mobile). Estilo compatível com os `card-turma` existentes.

## Comportamento de Interação

- **Expandir:** clicar no card (quando colapsado)
- **Colapsar:** clicar no card novamente (no cabeçalho), ou clicar fora do card
- **Navegar:** clicar em um dos 3 botões chama `selecionarTurma(materiaId, turmaId)` com os IDs corretos, exatamente como se o aluno tivesse percorrido a navegação normal
- O card não cria pushState próprio — apenas a navegação final para a turma cria entrada no histórico

## Mapeamento de Rotas

| Botão | `materiaId` | `turmaId` |
|---|---|---|
| Penal | `penal` | `penal-informativos-stj` |
| Proc. Penal | `processual-penal` | `processual-penal-informativos-stj` |
| Tributário | `tributario` | `tributario-informativos-stj` |

## Arquivos Modificados

| Arquivo | Mudança |
|---|---|
| `app.js` | Adicionar HTML do card e lógica de toggle em `renderArvore()` |
| `style.css` | Estilos do card expansível e dos 3 botões internos |

Nenhum arquivo em `data.js`, nenhuma rota nova, nenhum arquivo de conteúdo.

## Posição no Grid

O card aparece após os 3 cards de matéria existentes (Penal, Processual Penal, Tributário), como um quarto item no `.materias-cards`. Futuras matérias se adicionam normalmente — o card de jurisprudência fica sempre por último.

## Acessibilidade

- O card usa `<button>` (não `<a>`) para o toggle de expansão
- Os 3 links internos usam `<button>` com `onclick` chamando `selecionarTurma()`
- `aria-expanded` atualizado no toggle
- Foco gerenciado: ao expandir, foco vai para o primeiro botão interno
