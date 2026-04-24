# Meu Espaço — Design Spec
**Data:** 2026-04-24

## Objetivo

Adicionar uma aba "Meu Espaço" em cada página de tema do site estudos-direito, onde o aluno pode criar e salvar anotações pessoais e diagramas visuais. Os dados ficam salvos no localStorage do navegador do aluno.

---

## Posicionamento

"Meu Espaço" aparece como mais uma aba na barra de abas já existente em cada tema (ex: Visão Geral, Mapa Mental, Roteiro, Estudo de Caso → **✏️ Meu Espaço**). A aba fica ao final da barra, com cor dourada (`--gold`) para se diferenciar visualmente das abas de conteúdo.

---

## Estrutura interna

A aba "Meu Espaço" contém duas abas internas:

### Aba "Anotações"

Editor de texto baseado em `contenteditable` com toolbar:

| Botão | Ação |
|-------|------|
| **B** | `execCommand('bold')` |
| *I* | `execCommand('italic')` |
| <u>U</u> | `execCommand('underline')` |
| → Fluxo | Insere seta estilizada inline (`⟶`) |

- Auto-save no evento `input` com debounce de 500ms
- Salva o HTML interno no localStorage
- Chave: `meu-espaco-texto:<caminho-do-arquivo-do-tema>`

### Aba "Diagrama"

Três sub-abas, todas usando **Fabric.js via CDN** (carregado sob demanda ao primeiro clique em "Diagrama"):

**Mapa Mental**
- Clique no canvas cria nó (oval com texto)
- Shift+clique em dois nós cria seta de conexão entre eles
- Duplo-clique em nó abre edição de texto
- Nós são arrastáveis

**Linha do Tempo**
- Barra horizontal fixa no canvas
- Clique na barra adiciona evento com texto
- Eventos são arrastáveis ao longo da linha

**Canvas Livre**
- Toolbar com formas: Caixa / Círculo / Seta / Texto
- Clique no canvas insere a forma selecionada
- Todas as formas são arrastáveis e editáveis

Cada sub-aba salva o estado como JSON via `canvas.toJSON()` e restaura via `canvas.loadFromJSON()`.
- Chave: `meu-espaco-diagrama-<subtipo>:<caminho-do-arquivo-do-tema>`
  - `subtipo`: `mapa-mental`, `linha-do-tempo`, `canvas-livre`

---

## Apagar dados do tema

Dentro da aba "Meu Espaço", botão **"🗑 Apagar tudo deste tema"**:
- Exibe `confirm()` nativo antes de apagar
- Remove as chaves localStorage: `meu-espaco-texto:<arquivo>` e as três chaves de diagrama do tema
- Limpa o editor e o canvas da sessão atual

---

## Arquitetura — arquivos novos

| Arquivo | Responsabilidade |
|---------|-----------------|
| `meu-espaco.js` | Renderiza a aba, gerencia abas internas, toolbar, auto-save, inicializa Fabric.js, apagar |
| `meu-espaco.css` | Estilos da área, usando variáveis CSS existentes (`--blue`, `--gold`, `--serif`, etc.) |

Ambos carregados uma única vez no `index.html` via `<script src="meu-espaco.js">` e `<link rel="stylesheet" href="meu-espaco.css">`.

---

## Integração com páginas de tema

Nenhum arquivo de tema individual precisa ser modificado. A integração acontece em **`app.js`**, dentro da função `abrirTema()`, logo após o conteúdo ser injetado no DOM (após as correções de caminhos relativos, ~linha 625):

```js
MeuEspaco.init(area, tema.arquivo)
```

`meu-espaco.js` procura a barra de abas existente dentro de `area` (elemento com abas `.fp-tab`) e injeta a aba "Meu Espaço" ao final, sem modificar a lógica de tabs existente. Usa o mesmo padrão `.fp-tab` / `.fp-painel` já presente nos temas.

---

## Fabric.js — carregamento lazy

O script do Fabric.js (`https://cdnjs.cloudflare.com/ajax/libs/fabric.js/5.3.0/fabric.min.js`) é injetado dinamicamente no `<head>` apenas quando o aluno clica na aba "Diagrama" pela primeira vez. Isso evita impacto no carregamento inicial das outras abas.

---

## Comportamento mobile

- Toolbar em `flex-wrap: wrap`
- Fabric.js suporta touch events nativamente — nenhum código extra necessário para arrastar no mobile

---

## O que está fora do escopo

- Upload de imagens (JPEG ou qualquer outro formato)
- Sincronização entre dispositivos ou usuários
- Exportar/baixar o conteúdo criado
- Compartilhar anotações com outros alunos
