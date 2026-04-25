# Spec — Hiperlinks automáticos de julgados

**Data:** 2026-04-25
**Status:** Aprovado

---

## Objetivo

Detectar automaticamente citações de julgados do STF e STJ nos arquivos de conteúdo e envolvê-las em `<a>` com link para a busca oficial no tribunal correspondente, sem modificar nenhum HTML de conteúdo.

---

## Arquitetura

### Abordagem: pós-processamento dinâmico em `app.js`

Após o `fetch` de cada tema carregar o HTML em `conteudo-area`, uma nova função `linkificarJulgados(el)` percorre os **nós de texto** do container e substitui citações detectadas por `<a class="julgado-link">`.

Chamada em dois pontos de `app.js`:
1. Em `abrirTema()` — após os pós-processamentos existentes (imagens, links internos)
2. Em `renderConteudoTurma()` — quando um `turma.indice` é carregado

Nenhum arquivo HTML de conteúdo é alterado.

---

## Padrões detectados

### Acórdãos STJ (tribunal unívoco)
- Tipos: `REsp`, `AREsp`, `RHC`, `EREsp`, `AgRg no REsp`, `AgInt no REsp`, `AgRg no RHC`, `AgInt no RHC`
- Formato: `REsp 1.977.135`, `AREsp 2.123.334-MG`, `AgRg no HC 198.750/SP`
- Número: dígitos com pontos opcionais, sufixo `/UF` ou `-UF` opcional

### Acórdãos STF (tribunal unívoco)
- Tipos: `ADI`, `ADC`, `ADPF`, `ARE`, `MI`, `RCL`
- Formato: `ADI 4296/DF`, `ADPF 132/RJ`

### Acórdãos ambíguos (HC, MS, RE)
- Detecção de contexto: busca "STF" ou "STJ" em ±60 caracteres ao redor da citação
- Padrão quando não encontrado: `HC` → STJ; `RE` → STF; `MS` → STF

### Súmulas STJ
- Padrões: `Súmula N STJ`, `Súm. N STJ`, `Súmula nº N STJ`, `Súmula n. N STJ`

### Súmulas Vinculantes STF
- Padrões: `SV N`, `Súmula Vinculante N`, `Súmula Vinculante nº N`

### Temas repetitivos
- Padrões: `Tema N STJ`, `Tema N STF`, `Tema N do STJ`, `Tema N do STF`

### Prefixos de agravo (preservados no texto do link)
- `AgRg no/na`, `AgInt no/na`, `EDcl no/na`, `EDiv no/na`, `QO no/na`

---

## URLs de destino

| Tribunal | Tipo | URL |
|---|---|---|
| STJ | Acórdão | `https://scon.stj.jus.br/SCON/pesquisar.jsp?query={tipo}+{numero}` |
| STF | Acórdão | `https://jurisprudencia.stf.jus.br/pages/search?queryString={tipo}+{numero}` |
| STJ | Súmula | `https://scon.stj.jus.br/SCON/pesquisar.jsp?query=Súmula+{num}` |
| STF | Súmula Vinculante | `https://jurisprudencia.stf.jus.br/pages/search?queryString=Súmula+Vinculante+{num}` |
| STJ | Tema | `https://processo.stj.jus.br/repetitivos/temas_repetitivos/pesquisa.jsp?tipo=tabela&cod={num}` |
| STF | Tema | `https://jurisprudencia.stf.jus.br/pages/search?queryString=Tema+{num}` |

Todos os links: `target="_blank" rel="noopener noreferrer"`, `title="Ver no STJ"` / `"Ver no STF"`.

Número passado à URL: dígitos brutos sem pontuação (ex: `1977135`, não `1.977.135`).

---

## Visual

### CSS (adicionado em `style.css`)

```css
.julgado-link {
  color: inherit;
  text-decoration: underline;
  text-decoration-style: dotted;
  text-decoration-color: #1F497D;
  text-underline-offset: 3px;
  transition: color .15s, text-decoration-style .15s;
  white-space: nowrap;
}

.julgado-link::after {
  content: ' ⚖';
  font-size: 0.7em;
  opacity: 0.2;
  transition: opacity .15s;
  vertical-align: middle;
}

.julgado-link:hover {
  color: #1F497D;
  text-decoration-style: solid;
}

.julgado-link:hover::after {
  opacity: 1;
}

@media (hover: none) {
  .julgado-link::after { opacity: 0.7; }
}
```

### Comportamento
- Repouso: sublinhado pontilhado em `#1F497D`; ícone ⚖ pequeno (0.7em) com opacidade 20%
- Hover: sublinhado sólido, texto em `#1F497D`, ícone a 100%
- Mobile (sem hover): ícone sempre a 70%
- Texto da citação preservado exatamente como no original

---

## Implementação em `app.js`

### Nova seção `// ── Julgados ──`

```
linkificarJulgados(el)
  ├── define regexes para cada grupo de padrões
  ├── percorre nós de texto (TreeWalker), ignora <a>, <code>, <script>, <style>
  ├── para cada match: detecta tribunal, constrói URL, cria <a>
  └── substitui nó de texto por DocumentFragment com texto + links intercalados
```

### Ponto de chamada em `abrirTema()`
Após o bloco de correção de âncoras internas, antes de `MeuEspaco.init()`.

### Ponto de chamada em `renderConteudoTurma()`
Após o innerHTML do índice ser definido.

---

## Arquivos alterados

| Arquivo | Mudança |
|---|---|
| `app.js` | Nova seção `// ── Julgados ──` + 2 chamadas a `linkificarJulgados()` |
| `style.css` | Nova seção `/* Julgados */` com 5 regras |
| `preview-julgados.html` | Remover após implementação |

---

## Fora do escopo

- Modificar arquivos HTML de conteúdo
- Detectar referências a informativos (ex: "Info 819")
- Verificar se o julgado existe (apenas link para busca)
- Cache de URLs
