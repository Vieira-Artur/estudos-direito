# Design: Redesign do Card de Julgado — Destaque em Primeiro, Número na Margem

**Data:** 2026-04-30

---

## Problema

O card atual mostra PROCESSO → TEMA (negrito) → DESTAQUE. Para estudo jurídico, o DESTAQUE é o que importa — é a tese do julgado. PROCESSO e TEMA são metadados. A ordem atual obriga o aluno a rolar até o final para ver o conteúdo principal.

Além disso, alunos não têm como se referir a "o terceiro julgado deste informativo" — falta numeração.

---

## Design Aprovado

### Estrutura visual do card

```
[N]  ┌─────────────────────────────────────┐
     │ Destaque (15px, justificado)         │
     │                                      │
     │ Tema (12px, cinza, sem negrito)      │
     │ · · · · · · · · · · · · · · · · · · │
     │ Processo — Turma, data    RAMO       │
     └─────────────────────────────────────┘
```

- **`[N]`**: círculo azul (`#2563eb`, 28×28px) **fora do card**, à esquerda, alinhado ao topo. Numeração por edição: 1, 2, 3…
- **Destaque**: primeiro elemento dentro do card. `font-size: 15px`, `text-align: justify`, `hyphens: auto`, `lang="pt-BR"`. Já tem `margin-bottom: 12px`.
- **Tema**: abaixo do destaque. `font-size: 12px`, `color: var(--text2)`, sem negrito, sem serif.
- **Rodapé** (separado por linha tracejada): processo (monospace, 11px, cinza) + ramo (uppercase, 10px, mais claro). Igual ao atual mas reposicionado para baixo.

### Wrapper externo

O card passa a ser envolto em `<div class="inf-card-wrap">` com `display: flex; gap: 12px; align-items: flex-start`. O número fica fora do `.inf-card`.

```html
<div class="inf-card-wrap">
  <div class="inf-num">1</div>
  <article class="inf-card">
    <div class="inf-destaque" lang="pt-BR"><p>…</p></div>
    <div class="inf-tema">…</div>
    <div class="inf-card-foot">
      <span class="inf-processo">…</span>
      <span class="inf-ramo">…</span>
    </div>
  </article>
</div>
```

---

## Mudanças em `scripts/informativos_stj.py`

### CSS (`PAGE_STYLE`)

1. **Novo `.inf-card-wrap`**: `display:flex; gap:12px; align-items:flex-start; margin-bottom:18px`
2. **Novo `.inf-num`**: círculo `28×28px`, `background: var(--inf-accent)`, `color:#fff`, `border-radius:50%`, `flex-shrink:0`, `margin-top:18px` (alinha com o padding do card)
3. **Remover** `margin-bottom:18px` de `.inf-card` (passa para `.inf-card-wrap`)
4. **Remover** `.inf-card-head` (não existe mais cabeçalho com processo+ramo no topo)
5. **`.inf-tema`**: já está correto (12px, cinza, sem negrito) — sem alteração
6. **Novo `.inf-card-foot`**: `padding-top:10px; border-top:1px dashed var(--border); display:flex; flex-wrap:wrap; gap:6px 14px; align-items:baseline; margin-top:10px`
7. **`.inf-processo a`** / **`.inf-ramo`**: mantêm estilos mas usados no rodapé

### Função `_render_card(e, idx)`

Assinatura muda de `_render_card(e)` para `_render_card(e, idx)`.

Retorna o wrapper completo com número e card reorganizado.

### Função `render_edicao`

Linha que gera os cards muda de:
```python
cards = "\n".join(_render_card(e) for e in enunciados)
```
para:
```python
cards = "\n".join(_render_card(e, i + 1) for i, e in enumerate(enunciados))
```

---

## O que NÃO muda

- CSS do índice (`INDEX_STYLE`) — zero alteração
- Lógica de scraping, parsing, estado, git push
- Conteúdo dos campos (processo, ramo, tema, destaque)
- Responsividade existente (flex wrap já funciona em mobile)
