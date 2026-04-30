# Design: Informativos STJ — Correção e Automação Local

**Data:** 2026-04-29  
**Escopo:** Corrigir parser quebrado, adicionar git push automático, configurar Agendador de Tarefas do Windows.

---

## Problema

O script `scripts/informativos_stj.py` roda mas retorna 0 enunciados. Causa: a estratégia primária busca `div.resultado`, mas o portal STJ usa `div.clsInformativoBlocoItem`. Agendamento anterior via GitHub Actions causou suspensão da conta por scraping nos servidores do GitHub — proibido pelos termos de uso.

---

## Arquitetura

Raspagem local → gera HTML → commit + push → GitHub Pages serve o conteúdo.

O GitHub recebe apenas commits com arquivos HTML estáticos, como qualquer outro push manual. Nenhum código roda nos servidores do GitHub.

---

## Mudanças em `scripts/informativos_stj.py`

### 1. Nova estratégia primária de parsing

Função `parse_enunciados_cls()` adicionada e inserida primeiro em `parse_enunciados()`.

Estrutura real da página `processo.stj.jus.br?from=feed`:
```
div.clsInformativoBlocoItem   ← container de cada enunciado (18 por edição)
  div.clsInformativoLabel     ← rótulos: "Processo", "Ramo do Direito", "Tema"...
  div.clsInformativoTexto     ← valores dos campos (em ordem paralela aos labels)
  div.clsDestaqueAzul         ← aparece 2x: primeiro é o label "Destaque", segundo é o texto
```

Lógica de extração:
- Parear `clsInformativoLabel[i]` com `clsInformativoTexto[i]` para Processo, Ramo, Tema
- Destaque: pegar `clsDestaqueAzul` cujo texto tenha mais de 20 chars (pula o label)
- CNOT/link: buscar `<a href>` com "CNOT" no href dentro do bloco

### 2. Correção da extração de data

Atual: regex no texto bruto da página (não encontra).  
Novo: ler do `<title>` da página — formato confirmado: `"STJ - Informativo de Jurisprudência n. 886 - 28 de abril de 2026."`

Regex: `r"n\.\s*0*{numero}\s*[-–]\s*(\d{{1,2}} de \w+ de \d{{4}})"`

### 3. Git commit + push automático

No final de `main()`, após processar edições novas:
```python
subprocess.run(["git", "-C", str(REPO_ROOT), "add",
                str(TARGET_DIR.relative_to(REPO_ROOT))], check=True)
subprocess.run(["git", "-C", str(REPO_ROOT), "commit", "-m",
                f"feat: informativos STJ nº {lista_edicoes}"], check=True)
subprocess.run(["git", "-C", str(REPO_ROOT), "push"], check=True)
```

Só roda se `novos > 0` e `not args.dry_run`.

---

## Novo arquivo: `scripts/executar-informativos.bat`

Launcher para o Agendador de Tarefas:
```bat
@echo off
cd /d C:\Users\artur\Documents\estudos-direito
python scripts\informativos_stj.py >> logs\informativos.log 2>&1
```

Cria `logs/` se não existir. Logs não são commitados (`.gitignore`).

---

## Agendador de Tarefas do Windows

Tarefa criada via `schtasks`:
- **Nome:** `InformativosSTJ`
- **Trigger:** Toda segunda-feira às 06:00
- **Ação:** Executar `scripts\executar-informativos.bat`
- **Diretório:** `C:\Users\artur\Documents\estudos-direito`

Comando de setup (roda uma vez manualmente):
```
schtasks /create /tn "InformativosSTJ" /tr "C:\Users\artur\Documents\estudos-direito\scripts\executar-informativos.bat" /sc WEEKLY /d MON /st 06:00 /f
```

---

## O que NÃO muda

- HTML gerado (visual, CSS, cards)
- Estrutura de diretórios
- Lógica de filtro por ramo (regex `processual\s+penal`)
- Sistema de estado `_state.json`
- Estratégias de fallback existentes (ficam como backup)
- Integração com o SPA (data-tema, index.html)
