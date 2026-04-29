const materias = [
  {
    id: "penal",
    titulo: "Direito Penal",
    icone: "⚖️",
    turmas: [
      {
        id: "penal-iv",
        titulo: "Direito Penal IV",
        indice: "conteudo/penal/penal-iv/index.html",
        temas: [
          {
            titulo: "Crimes contra a Fé Pública",
            descricao: "Visão geral · Mapa mental · Roteiro de estudo · Estudo de caso",
            arquivo: "conteudo/penal/penal-iv/01-fe-publica.html"
          },
          {
            titulo: "Crimes contra a Adm. Pública",
            descricao: "Mapa mental · Mapa conceitual · Quadro sinóptico · Roteiro · Estudo de caso",
            arquivo: "conteudo/penal/penal-iv/02-adm-publica.html"
          },
          {
            titulo: "Crimes contra o Sentimento Religioso",
            descricao: "Tabela comparativa · Mapa mental · Roteiro de estudo · Estudo de caso",
            arquivo: "conteudo/penal/penal-iv/03-sentimento-religioso.html"
          },
          {
            titulo: "Crimes contra a Dignidade Sexual",
            descricao: "Tabela comparativa · Guia comparativo · Roteiro de estudo · Jurisprudência",
            arquivo: "conteudo/penal/penal-iv/04-dignidade-sexual.html"
          }
        ],
        flashcards: [
          {
            frente: "Qual o bem jurídico protegido pelos crimes contra a Fé Pública?",
            verso: "A confiança e a credibilidade da sociedade na autenticidade de documentos, moeda e símbolos públicos."
          },
          {
            frente: "O que é falsidade material?",
            verso: "Alteração física do documento — rasura, adulteração, contrafação ou supressão."
          },
          {
            frente: "O que é falsidade ideológica (Art. 299 CP)?",
            verso: "Omissão ou inserção de declaração falsa em documento verdadeiro, com fim de criar obrigação, alterar a verdade ou prejudicar direito."
          },
          {
            frente: "Qual a diferença entre peculato-apropriação e peculato-furto?",
            verso: "No peculato-apropriação (Art. 312 caput), o funcionário já tem a posse do bem. No peculato-furto (§1º), o agente subtrai o bem aproveitando-se da facilidade do cargo."
          },
          {
            frente: "O que é peculato culposo (Art. 312 §2º CP)?",
            verso: "Ocorre quando o funcionário facilita, por negligência, a subtração ou apropriação indevida por terceiro. Admite extinção da punibilidade pela reparação do dano antes da sentença irrecorrível."
          }
        ]
      }
    ]
  },
  {
    id: "processual-penal",
    titulo: "Direito Processual Penal",
    icone: "🏛️",
    turmas: [
      {
        id: "processual-penal-i",
        titulo: "Direito Processual Penal I",
        temas: []
      },
      {
        id: "processual-penal-ii",
        titulo: "Direito Processual Penal II",
        indice: "conteudo/processual-penal-ii/index.html",
        temas: [
          {
            titulo: "Teoria Geral das Provas",
            descricao: "Revisão geral · Prova vs elemento informativo · Sistemas de avaliação · Prova ilícita · Cadeia de custódia",
            arquivo: "conteudo/processual-penal-ii/01-teoria-geral-provas.html"
          },
          {
            titulo: "Provas em Espécie",
            descricao: "Perícia · Interrogatório · Confissão · Prova testemunhal · Reconhecimento · Busca e apreensão",
            arquivo: "conteudo/processual-penal-ii/02-provas-em-especie.html"
          },
          {
            titulo: "Prisões e Cautelares",
            descricao: "Flagrante · Preventiva · Temporária · Medidas cautelares · Prisão domiciliar · Fiança · Audiência de custódia",
            arquivo: "conteudo/processual-penal-ii/03-prisoes.html"
          }
        ],
        flashcards: [
          {
            frente: "Qual a diferença entre prova e elemento informativo?",
            verso: "Prova é produzida sob contraditório judicial. Elemento informativo (ex: inquérito policial) prescinde do contraditório e serve apenas para formar a opinio delicti."
          },
          {
            frente: "O que é prova ilícita por derivação (teoria dos frutos da árvore envenenada)?",
            verso: "São provas obtidas a partir de uma prova ilícita originária. São inadmissíveis salvo quando: (a) não evidenciado nexo causal; (b) obtidas por fonte independente; (c) poderia ser descoberta por outra via (descoberta inevitável)."
          },
          {
            frente: "Quais são os pressupostos da prisão preventiva?",
            verso: "Fumus commissi delicti (indícios de autoria e materialidade) + periculum libertatis (garantia da ordem pública, ordem econômica, conveniência da instrução ou aplicação da lei penal). Não cabe de ofício — exige requerimento ou representação."
          },
          {
            frente: "Por quanto tempo pode durar a prisão temporária em crime hediondo?",
            verso: "30 dias, prorrogável por mais 30 em caso de extrema necessidade (Lei 7.960/89, art. 2º, §4º). Para crimes comuns: 5 + 5 dias."
          }
        ]
      },
      {
        id: "processual-penal-iii",
        titulo: "Direito Processual Penal III",
        temas: [
          {
            titulo: "Procedimentos",
            descricao: "Devido processo legal · Critério pela pena · Rito ordinário · AIJ · Alegações finais · Sentença",
            arquivo: "conteudo/processual-penal-iii/01-procedimentos.html"
          }
        ]
      },
      {
        id: "processual-penal-informativos-stj",
        titulo: "Jurisprudência",
        indice: "conteudo/processual-penal-informativos-stj/index.html",
        temas: []
      }
    ]
  },
  {
    id: "tributario",
    titulo: "Direito Tributário",
    icone: "📜",
    turmas: [
      {
        id: "tributario-financeiro-i",
        titulo: "Direito Tributário e Financeiro I",
        temas: [
          {
            titulo: "Fundamentos e Crédito Tributário",
            descricao: "Visão geral · Mapa mental · Roteiro de estudo · Estudo de caso",
            arquivo: "conteudo/tributario/tributario-financeiro-i/01-guia-estudos.html"
          }
        ],
        flashcards: [
          {
            frente: "Quais são as modalidades de extinção do crédito tributário (Art. 156 CTN)?",
            verso: "Pagamento, compensação, transação, remissão, prescrição, decadência, conversão de depósito em renda, pagamento antecipado + homologação, consignação em pagamento, decisão administrativa/judicial irreformável, dação em pagamento de bens imóveis."
          },
          {
            frente: "Qual a diferença entre decadência e prescrição tributária?",
            verso: "Decadência: extinção do direito de constituir o crédito tributário (prazo para lançamento — Art. 173 CTN). Prescrição: extinção do direito de cobrar o crédito já constituído (5 anos da constituição definitiva — Art. 174 CTN)."
          },
          {
            frente: "O que é substituição tributária para frente (progressiva)?",
            verso: "O fato gerador ainda não ocorreu, mas o tributo é recolhido antecipadamente pelo substituto (ex: fabricante recolhe ICMS do varejista). Admitida pelo Art. 150 §7º CF. Se o fato não ocorrer, garante-se a restituição."
          }
        ]
      },
      {
        id: "processo-tributario",
        titulo: "Processo Tributário",
        indice: "conteudo/tributario/processo-tributario/index.html",
        temas: [
          {
            titulo: "A Fazenda Pública em Juízo",
            descricao: "Conceito · Prerrogativas processuais · Reexame necessário · Honorários escalonados · Precatórios e RPV",
            arquivo: "conteudo/tributario/processo-tributario/01-fazenda-publica.html"
          },
          {
            titulo: "O Lançamento Tributário",
            descricao: "5 funções do lançamento · Modalidades (direto, misto, homologação) · Regra do tempo · Revisão do crédito",
            arquivo: "conteudo/tributario/processo-tributario/02-lancamento.html"
          },
          {
            titulo: "A Execução Fiscal (LEF)",
            descricao: "Da obrigação à CDA · Citação · Embargos vs. Exceção de pré-executividade · Expropriação · Redirecionamento",
            arquivo: "conteudo/tributario/processo-tributario/03-execucao-fiscal.html"
          }
        ]
      }
    ]
  }
]
