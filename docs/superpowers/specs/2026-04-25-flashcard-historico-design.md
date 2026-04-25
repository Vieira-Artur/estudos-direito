# Spec: Histórico de Sessões de Flashcards

**Data:** 2026-04-25
**Status:** Aprovado

## Objetivo

Permitir que o aluno veja suas últimas sessões de flashcard (data, % de acerto, tendência) na tela de resumo ao final de cada sessão.

## Comportamento

### Quando salvar
- Ao completar uma sessão inteira (último card avaliado em `avaliarCard`)
- **Não** salva ao reiniciar no meio (`reiniciarSessao`)

### O que salvar
Objeto por sessão:
```js
{ data: Date.now(), acertos: number, total: number }
```

Chave localStorage: `flashcards_historico_${turmaId}`
Máximo de 10 sessões por turma. Ao atingir 11, a mais antiga é removida (FIFO).

### Cálculo de tendência
- Compara % da última sessão com média das 2 anteriores
- `↑` se diferença ≥ +5 pontos percentuais
- `↓` se diferença ≤ -5 pontos percentuais
- `→` se dentro de ±5 pontos
- Só exibe tendência a partir da 3ª sessão (sem histórico suficiente = sem ícone)

### Exibição na tela de resumo
Abaixo do botão "Reiniciar sessão", seção "Suas últimas sessões" com as 5 sessões mais recentes (mais recente primeiro). Cada linha:

```
[tendência]  [data formatada]  [%]  [N cards]
↑            Hoje, 14h         80%  10 cards
→            22/04             75%  10 cards
↓            20/04             60%   8 cards
```

Formatação da data:
- Hoje: "Hoje, HH:mm"
- Ontem: "Ontem, HH:mm"
- Demais: "dd/mm"

Seção não aparece se não houver histórico (primeira sessão do aluno nessa turma).

## Mudanças de código

Apenas `app.js`:

1. **`salvarHistoricoSessao(turmaId, acertos, total)`** — nova função que lê, acrescenta e limita a 10 sessões no localStorage.

2. **`carregarHistorico(turmaId)`** — retorna array (mais recente primeiro), vazio se não houver.

3. **`calcularTendencia(historico)`** — retorna `'↑'`, `'↓'`, `'→'` ou `''` (sem dados suficientes).

4. **`formatarDataSessao(timestamp)`** — retorna string formatada (Hoje/Ontem/dd/mm).

5. **`avaliarCard`** — chamar `salvarHistoricoSessao` quando `proximo >= todos.length`.

6. **`renderFlashResumoHTML`** — incluir bloco de histórico após o botão de reiniciar.

## Fora de escopo
- Gráfico de evolução
- Histórico por card individual
- Exportação de dados
- Histórico entre dispositivos (localStorage é local)
