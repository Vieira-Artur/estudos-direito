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
            descricao: "Mapa mental · Prova vs elemento informativo · Sistemas de avaliação · Prova ilícita · Cadeia de custódia",
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
        ]
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
        ]
      },
      {
        id: "processo-tributario",
        titulo: "Processo Tributário",
        indice: "conteudo/tributario/processo-tributario/index.html",
        temas: []
      }
    ]
  }
]
