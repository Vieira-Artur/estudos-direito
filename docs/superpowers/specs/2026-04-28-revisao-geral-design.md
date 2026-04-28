# Revisão Geral do Site — Design Spec

**Data:** 2026-04-28  
**Escopo:** Correções de consistência, UX mobile e dark mode no shell  
**Abordagem:** Por tipo de problema (varredura temática)

---

## Seção 1 — Correções e Consistência

### 1.1 `data.js` — descrições desatualizadas

Três temas de Processual Penal II têm "Mapa mental" na propriedade `descricao`, referência obsoleta após renomeação das abas para "Revisão Geral".

**Alterações:**
- `"Teoria Geral das Provas"`: trocar `"Mapa mental ·"` por `"Revisão geral ·"`
- `"Provas em Espécie"`: idem
- `"Prisões e Medidas Cautelares"`: idem

### 1.2 Bug `.tag-gold`

Em `conteudo/processual-penal-ii/01-teoria-geral-provas.html`, a classe `.tag-gold` está definida com cores azuis em vez de douradas:

```css
/* ERRADO */
.tag-gold { background: var(--blue-light); color: var(--blue); }

/* CORRETO */
.tag-gold { background: var(--gold-light); color: var(--gold); }
```

### 1.3 Font-size das abas — padronização

`.fp-tab` (páginas de Penal IV) usa `font-size: 14px`. Todos os outros sistemas de abas usam `13px`. Padronizar `.fp-tab` para `13px` nos arquivos:
- `conteudo/penal/penal-iv/01-fe-publica.html`
- `conteudo/penal/penal-iv/02-adm-publica.html`
- `conteudo/penal/penal-iv/03-sentimento-religioso.html`
- `conteudo/penal/penal-iv/04-dignidade-sexual.html`

### 1.4 Títulos de seção internos — padronização

Dois estilos diferentes para o mesmo elemento semântico (subtítulo dentro de aba):

| Classe | Border | Cor | Font-size |
|--------|--------|-----|-----------|
| `.section-title` (pp1, pp2, pp3) | 4px azul | azul | 1.3rem |
| `.fp-sec` (Penal IV) | 3px dourado | azul | 15px |
| `.tf-section-title` (Tributário) | 3px dourado | azul | 15px |

**Decisão:** padronizar `.section-title` para borda dourada de 3px (`var(--gold)`), alinhando com o padrão da maioria das páginas e com a identidade visual do site. Font-size mantido em `1.3rem` (ligeiramente maior que as demais, mas serve como hierarquia dentro de painéis mais densos).

Arquivos afetados: `01-teoria-geral-provas.html`, `02-provas-em-especie.html`, `03-prisoes.html`.

---

## Seção 2 — UX Mobile

**Problema:** Páginas com muitas abas (Teoria Geral: 10, Prisões: 11) exibem as abas em wrap multi-linha em telas pequenas, ocupando muito espaço vertical.

**Solução:** Adicionar `@media (max-width: 540px)` em cada sistema de abas, compactando padding e font-size:

```css
@media (max-width: 540px) {
  .pp1-tab, .pp2-tab, .pp3-tab, .fp-tab, .tf-tab {
    padding: 4px 9px;
    font-size: 11.5px;
  }
}
```

Cada arquivo tem sua própria classe de aba, então a media query vai dentro do `<style>` de cada página.

**Arquivos afetados:** todos os arquivos de conteúdo com sistemas de abas (listados na tabela abaixo — 9 arquivos, excluindo `style.css`).

---

## Seção 3 — Dark Mode no Shell

**Problema:** `style.css` não tem `@media (prefers-color-scheme: dark)`. O shell (header, hero, árvore de matérias, rodapé) fica sempre claro mesmo quando o sistema do usuário está em dark mode. As páginas de conteúdo já têm dark mode próprio.

**Solução:** Adicionar bloco de tokens dark ao `style.css`:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --bg:          #0f1923;
    --surface:     #162233;
    --border:      #1e3350;
    --text:        #e8edf5;
    --text2:       #8fa3bc;
    --blue-light:  #1a3050;
    --blue-hover:  #1a3050;
    --gold-light:  #2a2010;
  }
}
```

O header já usa `var(--blue-dark)` e `var(--blue)` no gradiente — esses tokens ficam iguais no dark mode (o header já é escuro). Apenas os tokens de fundo, superfície, borda e texto precisam mudar.

---

## Arquivos Afetados

| Arquivo | Seção |
|---------|-------|
| `data.js` | 1.1 |
| `conteudo/processual-penal-ii/01-teoria-geral-provas.html` | 1.2, 1.4, 2 |
| `conteudo/processual-penal-ii/02-provas-em-especie.html` | 1.4, 2 |
| `conteudo/processual-penal-ii/03-prisoes.html` | 1.4, 2 |
| `conteudo/penal/penal-iv/01-fe-publica.html` | 1.3, 2 |
| `conteudo/penal/penal-iv/02-adm-publica.html` | 1.3, 2 |
| `conteudo/penal/penal-iv/03-sentimento-religioso.html` | 1.3, 2 |
| `conteudo/penal/penal-iv/04-dignidade-sexual.html` | 1.3, 2 |
| `conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html` | 2 |
| `style.css` | 3 |

---

## Ordem de Execução

1. `data.js` e bug `.tag-gold` (correções pontuais, menor risco)
2. Padronização de font-size e títulos de seção (varredura em todos os arquivos)
3. Media queries mobile (varredura em todos os arquivos)
4. Dark mode em `style.css`

Cada etapa é um commit separado.
