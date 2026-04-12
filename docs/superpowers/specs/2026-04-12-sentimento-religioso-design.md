# Design: Crimes contra o Sentimento Religioso (Penal IV)

**Data:** 2026-04-12
**Disciplina:** Direito Penal IV
**Fonte primária:** Slides PPTX do Prof. Artur Vieira (7 slides, Arts. 208–212 CP)

---

## 1. Objetivo

Criar um arquivo de guia de estudos unificado — `03-sentimento-religioso.html` — no padrão já estabelecido pelo site (igual a `01-fe-publica.html`), substituindo os 6 arquivos fragmentados existentes sobre o mesmo tema.

---

## 2. Arquivos

### Deletar
- `conteudo/penal/penal-iv/sentimento-religioso.html`
- `conteudo/penal/penal-iv/sentimento-religioso-mapa.html`
- `conteudo/penal/penal-iv/sentimento-religioso-roteiro.html`
- `conteudo/penal/penal-iv/sentimento-religioso-tabela.html`
- `conteudo/penal/penal-iv/sentimento-religioso-smartart.html`
- `conteudo/penal/penal-iv/sentimento-religioso-smartart.svg`

### Criar
- `conteudo/penal/penal-iv/03-sentimento-religioso.html`

---

## 3. Padrão Visual

- **Prefixo CSS:** `sr-`
- **Acento principal:** roxo-escuro `#4a1a8a` / lilás claro `#ede5fb`
- **Variáveis CSS próprias:** `--sr-purple`, `--sr-purple-lt`, mais as variáveis globais do site (`--blue`, `--gold`, `--sans`, `--serif`, `--surface`, `--border`, `--text`, `--text2`)
- **Dark mode:** variantes mais claras/saturadas para fundo escuro
- **Sistema de abas:** igual ao de `01-fe-publica.html` (`.sr-tab` / `.sr-painel`)

---

## 4. Conteúdo — Crimes cobertos

| Art. | Crime | Pena |
|------|-------|------|
| 208 | Ultraje a culto (escarnecer / impedir / vilipendiar ato religioso) | Detenção 1m–1a ou multa; +1/3 se violência |
| 209 | Impedimento ou perturbação de cerimônia funerária | Detenção 1m–1a ou multa; +1/3 se violência |
| 210 | Violação de sepultura | Reclusão 1–3a e multa |
| 211 | Destruição, subtração ou ocultação de cadáver | Reclusão 1–3a e multa |
| 212 | Vilipêndio a cadáver | Detenção 1–3a e multa |

---

## 5. Abas

### Aba 1 — Tabela Comparativa

Colunas: **Artigo · Crime · Conduta(s) · Pena · Observações**

- Badges coloridos: detenção (azul), reclusão (vermelho), multa (laranja)
- Badge especial para "violência → +1/3" nos Arts. 208 e 209
- Coluna Observações traz: crime comum/próprio, forma culposa (não existe no 210), execução livre (212), bem jurídico protegido

### Aba 2 — Mapa Mental interativo

- Nó central: **"Crimes contra o Sentimento Religioso"** (Arts. 208–212 CP)
- 5 ramos clicáveis, um por artigo
- Painel de detalhes ao clicar: bem jurídico, sujeito ativo, sujeito passivo, elemento subjetivo, ponto doutrinário destaque (Rogério Sanches onde citado nos slides)
- Layout: coluna esquerda (Arts. 208–209) + centro + coluna direita (Arts. 210–212)

### Aba 3 — Roteiro de Estudo

4 blocos sequenciais:

1. **Bem jurídico do Capítulo** — sentimento religioso (culto vivo) + respeito aos mortos (cerimônias e cadáver); base constitucional: CF art. 5º, VI
2. **Art. 208 — Ultraje a culto** — 3 condutas alternativas; requisito de publicidade; parágrafo único (violência); distinção: crítica legítima vs escárnio típico
3. **Arts. 209–210 — Cerimônias fúnebres e sepultura** — crime comum (209); conceito amplo de sepultura (210); ausência de forma culposa no 210
4. **Arts. 211–212 — Crimes contra o cadáver** — partes protegidas (Rogério Sanches); vilipêndio: execução livre; exige ação sobre/junto ao cadáver ou cinzas

Alertas visuais (`.sr-alert`) para pontos frequentes em prova:
- "Existe forma culposa no Art. 210?" → Não
- "Art. 209 é crime comum?" → Sim
- "Art. 212 é crime de execução livre?" → Sim
- "O escárnio precisa ser público?" → Sim (Art. 208)

### Aba 4 — Estudo de Caso

3 questões no formato acordeão (`.sr-pergunta`):

**A.** Pastor que, durante sermão transmitido ao vivo, zomba publicamente de ritual de candomblé — configura Art. 208?
- Resposta: analisa publicidade, motivo religioso, escárnio vs crítica religiosa legítima (liberdade de expressão × bem jurídico)

**B.** Manifestantes que interrompem enterro para protesto político — Art. 209 ou outra tipificação?
- Resposta: analisa impedir/perturbar, finalidade do agente, crime comum, parágrafo único se houver violência

**C.** Médico legista que, após autópsia, descarta parte do cadáver sem autorização — Art. 211 ou 212?
- Resposta: analisa destruir vs vilipendiar, partes separadas após a morte (Rogério Sanches), elemento subjetivo

---

## 6. JavaScript

Funções a implementar (mesmo padrão de `01-fe-publica.html`):
- `srTab(id, btn)` — troca abas
- `srBranch(key)` — exibe painel de detalhe do ramo no mapa mental
- `srToggle(head)` — acordeão do estudo de caso

---

## 7. Integração com o site

- Verificar se `conteudo/penal/penal-iv/index.html` referencia os arquivos antigos e atualizar o link para `03-sentimento-religioso.html`
- Verificar se `data.js` ou `app.js` na raiz lista os arquivos de Penal IV e atualizar se necessário
