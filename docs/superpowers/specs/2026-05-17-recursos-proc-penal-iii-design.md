# Design: Aba "Recursos" — Processo Penal III

**Data:** 2026-05-17  
**Fonte:** `Proc. Penal 3 - Recursos.pptx` + CPP  
**Questões de concurso:** não incluídas (decisão do usuário)

---

## Objetivo

Adicionar um terceiro tema ("Recursos") à turma `processual-penal-iii` no site estudos-direito, cobrindo teoria geral dos recursos, pressupostos de admissibilidade, efeitos e recursos em espécie do CPP.

---

## Arquivos a criar/modificar

| Arquivo | Ação |
|---|---|
| `conteudo/processual-penal-iii/03-recursos.html` | Criar |
| `data.js` | Adicionar tema na turma `processual-penal-iii` |

---

## data.js — entrada a adicionar

```js
{
  titulo: "Recursos",
  descricao: "Conceito · Princípios · Pressupostos · Prazos · RESE · Apelação · Embargos",
  arquivo: "conteudo/processual-penal-iii/03-recursos.html"
}
```

Inserir após o tema "Nulidades" na turma `processual-penal-iii`.

---

## 03-recursos.html — estrutura de abas

Reutilizar os componentes CSS já existentes em `02-nulidades.html`:  
`.pt-tabs`, `.pt-tab`, `.pt-painel`, `.pt-card`, `.pt-alert`, `.pt-section-title`, `.pt-table`, `.pt-table-wrap`, `.pt-divider`

Definir variáveis de cor locais (prefixo `--rc-`) para as 4 cores de destaque das abas, seguindo o padrão `--nn-*` de nulidades.

### Aba 1 — Conceito & Princípios

**Bloco de conceito:**  
`pt-alert info` com o conceito doutrinário de R. Brasileiro:  
> "Recurso é o instrumento processual voluntário de impugnação de decisões judiciais, previsto em lei federal, utilizado antes da preclusão e na mesma relação jurídica processual, objetivando a reforma, a invalidação, a integração ou o esclarecimento da decisão judicial impugnada."

**Grid de 8 cards** (`.pt-grid`, `minmax(210px,1fr)`), um por princípio:

| # | Princípio | Ponto-chave | Artigo CPP |
|---|---|---|---|
| 1 | Duplo grau de jurisdição | Implícito na CF (art. 5º, LIV e LV); órgão diverso analisa | — |
| 2 | Taxatividade | Só há recurso com previsão legal; rol taxativo | — |
| 3 | Unirrecorribilidade | Uma decisão → um recurso | — |
| 4 | Fungibilidade | Recurso interposto erroneamente é processado como o cabível, salvo má-fé (prazo ou erro grosseiro) | Arts. 579–580 |
| 5 | Voluntariedade | Regra: interposição pela parte; exceções: reexame necessário | Art. 574 |
| 6 | Non reformatio in pejus | Recurso exclusivo da defesa: proibido agravar situação do réu (direta e indireta) | Art. 617 |
| 7 | Reformatio in mellius | Tribunal pode melhorar situação do réu mesmo sem recurso da defesa | — |
| 8 | Disponibilidade | Pode-se desistir de recurso já interposto; MP não pode desistir | Art. 576 |

### Aba 2 — Pressupostos de Admissibilidade

**Recolhimento à prisão:** `pt-alert atencao` explicando que o art. 594 (condição de admissibilidade) foi revogado — réu não precisa se recolher para apelar.

**Prazo recursal — regras gerais:** `pt-alert info` com art. 798 CPP (prazos contínuos, peremptórios, não interrompidos por férias/domingo/feriado); nota sobre início × contagem do prazo.

**Legitimidade:** `pt-alert info` com art. 577 CPP (MP, querelante, réu, procurador, defensor); nota sobre intimação pessoal do MP e citação por edital.

**Tabela de prazos:**

| Prazo | Recurso |
|---|---|
| 48 horas | Carta testemunhável (art. 640) — contado em horas somente se mandado registrar hora exata; caso contrário, 2 dias |
| 2 dias | Embargos de declaração (1ª e 2ª instância — arts. 382 e 619); matéria penal no STJ (art. 263 RISTJ) |
| 5 dias | Apelação (art. 593); RESE (art. 586); agravo em execução (LEP, art. 197 — Súmula 700 STF); RO para STJ/STF contra HC denegatório; ED nos JECrim e STF |
| 10 dias | Embargos infringentes e de nulidade (art. 609, § único); apelação nos JECrim (Lei 9.099/95, art. 82, §1º) |
| 15 dias | RE e REsp (CPC, art. 1003, §5º); RO para STJ contra MS denegatório; apelação subsidiária do ofendido não habilitado (art. 598, § único) |
| 20 dias | RESE contra lista de jurados (art. 586, § único) |
| Em dobro | Defensorias Públicas |

### Aba 3 — Efeitos dos Recursos

**Cards por efeito:**

| Efeito | Descrição | Exemplos |
|---|---|---|
| Devolutivo | Devolve ao órgão ad quem o conhecimento da matéria impugnada | Todos os recursos |
| Suspensivo | Suspende execução da decisão até julgamento do recurso | Apelação de sentença condenatória (art. 597); não se aplica a sentença absolutória (art. 596) |
| Regressivo / Iterativo / Diferido | Devolve a matéria ao próprio juízo a quo para reexame | RESE (retratação), Embargos de Declaração |
| Extensivo / Comunicante | Decisão favorável proferida em recurso de corréu aproveita aos demais, se o motivo não for de caráter exclusivamente pessoal | Art. 580 CPP |

### Aba 4 — Recursos em Espécie

**Seção RESE (art. 581):**  
`pt-section-title` + lista compacta dos 25 incisos agrupados por tema:
- Competência e pressupostos (I, II, III)
- Pronúncia e júri (IV, XIV)
- Fiança, prisão e liberdade (V, VII)
- Extinção da punibilidade e prescrição (VIII, IX)
- Suspensão condicional da pena e livramento condicional (XI, XII)
- Habeas corpus (X)
- Outros incidentes processuais (XIII, XVI, XVII, XVIII)
- Medida de segurança (XIX–XXIII)
- Outros (XXIV — multa; XXV — ANPP)

**Seção Apelação (art. 593):**  
Cabimento em 3 incisos (juiz singular condenatório/absolutório; decisões definitivas não previstas; Tribunal do Júri — 4 hipóteses da alínea III).  
Efeito suspensivo: sentença condenatória (art. 597); sem efeito suspensivo: sentença absolutória (art. 596).  
Apelação subsidiária do ofendido (art. 598): prazo 15 dias após o MP.

**Seção Embargos de Declaração:**  
1ª instância — art. 382 (prazo 2 dias); 2ª instância — art. 619 (prazo 2 dias).  
Hipóteses: obscuridade, ambiguidade, contradição, omissão.

**Seção Embargos Infringentes e de Nulidade (art. 609, § único):**  
Cabimento: decisão de 2ª instância não unânime e desfavorável ao réu.  
Prazo: 10 dias da publicação do acórdão.  
Abrangência: restritos à matéria divergente se o desacordo for parcial.

---

## Componentes CSS

Sem criação de novo arquivo CSS. Todas as classes reutilizadas de `02-nulidades.html` via `<style>` inline no próprio HTML (padrão do projeto). Variáveis locais `--rc-*` para cores de acento de cada aba.

---

## Sem escopo

- Revisão criminal (ação autônoma de impugnação, não recurso)
- Habeas corpus e mandado de segurança (ações autônomas)
- Agravo regimental / interno (não coberto no PPTX)
- Questões de concurso
