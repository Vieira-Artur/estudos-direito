# Design: Árvore Visual de Matérias na Página Inicial

**Data:** 2026-04-05  
**Status:** Aprovado

---

## Problema

A página inicial atual exibe 3 cards simples (matérias). O usuário precisa clicar em cada card para descobrir o que há dentro — a hierarquia de turmas e temas é invisível. A página parece pobre visualmente e esconde o conteúdo disponível.

## Solução

Substituir os cards simples por uma **árvore visual de ramos** que exibe toda a hierarquia (matéria → turma → tema) já na página inicial, com navegação direta ao conteúdo ao clicar num tema.

---

## Design

### Layout

- Três colunas lado a lado, uma por matéria, separadas por uma linha vertical sutil.
- Cada coluna tem: nó raiz (matéria) → conector vertical → nó(s) de turma → conector vertical → lista de temas.
- A árvore ocupa toda a largura disponível (`max-width: 960px`, herdado do `main`).
- Scroll horizontal habilitado caso a tela seja estreita.

### Hierarquia visual

| Nível | Elemento | Estilo |
|-------|----------|--------|
| Matéria | Nó raiz | Fundo `#1a3a5c`, texto branco, 18px bold, border-radius 10px |
| Turma | Nó intermediário | Fundo `#e8f0fe`, borda `#1a3a5c`, 15px bold, cor `#1a3a5c` |
| Turma vazia | Nó intermediário | Fundo `#f0f0f0`, borda cinza, texto cinza itálico, "(em breve)" |
| Tema | Folha clicável | Fundo branco, borda `#dde3ee`, 14px, hover: fundo `#eef3ff` + seta `→` + deslocamento 2px |
| Tag/descrição | Subtexto do tema | 12px, cor `#888` |

### Conectores

- Linha vertical (`width: 2px`, cor `#1a3a5c`) conectando matéria → turma → temas.
- Turmas vazias não têm conector descendente.

### Interação

- **Clicar num tema**: abre o conteúdo diretamente (chama `abrirTema()` com matéria e turma já definidos no estado), **sem passar pelas telas intermediárias**.
- **Clicar numa matéria ou turma**: sem ação — a árvore já expõe tudo.
- Hover nos temas: `→` aparece à esquerda, fundo muda para `#eef3ff`, leve deslocamento horizontal.
- Breadcrumb e navegação por `history.pushState` mantidos normalmente ao abrir um tema.

### Turmas e temas atuais (dados em `data.js`)

**Direito Penal**
- Penal IV
  - Crimes contra a Dignidade Sexual
  - Crimes contra o Sentimento Religioso *(página única combinando Tabela, Mapa Mental, Roteiro e SmartArt)*

**Direito Processual Penal**
- Processual Penal I *(em breve, sem temas)*
- Processual Penal II
  - Teoria Geral das Provas
  - Provas em Espécie
  - Prisões e Cautelares

**Direito Tributário**
- Tributário e Financeiro I *(em breve, sem temas)*

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---------|------|
| `app.js` | Substituir `renderMaterias()` pela nova função `renderArvore()` |
| `style.css` | Adicionar estilos da árvore (`.arvore`, `.ramo`, `.no-materia`, `.no-turma`, `.no-tema`, etc.) |
| `conteudo/penal/penal-iv/sentimento-religioso.html` | **Criar** — página única combinando os 4 materiais de Sentimento Religioso |
| `data.js` | Já atualizado: Crimes contra a Vida removido; Sentimento Religioso unificado; Proc. Penal I e Tributário e Financeiro I adicionados |

### Arquivos obsoletos (manter por ora, não deletar)

Os 4 arquivos separados de Sentimento Religioso (`*-tabela.html`, `*-mapa.html`, `*-roteiro.html`, `*-smartart.html`) ficam no disco mas não são mais referenciados no `data.js`.

---

## Fora de escopo

- Animações de entrada da árvore
- Collapse/expand de ramos
- Responsivo mobile além do scroll horizontal já existente
