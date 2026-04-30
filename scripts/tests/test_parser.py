import sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).resolve().parent.parent.parent))

from bs4 import BeautifulSoup

FIXTURE_886 = """\
<!DOCTYPE html>
<html>
<head><title>STJ - Informativo de Jurisprudência n. 886 - 28 de abril de 2026.</title></head>
<body>
<div class="clsInformativoBlocoItem">
  <div class="clsInformativoLabel">Processo</div>
  <div class="clsInformativoTexto">AgRg no REsp 2.000.001-SP, Rel. Ministro Teste, Quinta Turma, julgado em 15/4/2026.</div>
  <div class="clsInformativoLabel">Ramo do Direito</div>
  <div class="clsInformativoTexto">DIREITO PROCESSUAL PENAL</div>
  <div class="clsInformativoLabel">Tema</div>
  <div class="clsInformativoTexto">Habeas corpus. Prisão preventiva. Excesso de prazo.</div>
  <div class="clsInformativoLabel">Destaque</div>
  <div class="clsDestaqueAzul">Destaque</div>
  <div class="clsDestaqueAzul">O excesso de prazo na formação da culpa é causa de relaxamento da prisão preventiva.</div>
</div>
<div class="clsInformativoBlocoItem">
  <div class="clsInformativoLabel">Processo</div>
  <div class="clsInformativoTexto">REsp 3.000.001-RJ, Rel. Ministra Outra, Segunda Turma, julgado em 16/3/2026.</div>
  <div class="clsInformativoLabel">Ramo do Direito</div>
  <div class="clsInformativoTexto">DIREITO ADMINISTRATIVO</div>
  <div class="clsInformativoLabel">Tema</div>
  <div class="clsInformativoTexto">Licitação. Dispensa. Requisitos.</div>
  <div class="clsInformativoLabel">Destaque</div>
  <div class="clsDestaqueAzul">Destaque</div>
  <div class="clsDestaqueAzul">A dispensa de licitação exige demonstração de pressupostos legais.</div>
</div>
</body>
</html>
"""


def test_parse_enunciados_cls_retorna_so_processual_penal():
    from scripts.informativos_stj import parse_enunciados_cls
    soup = BeautifulSoup(FIXTURE_886, "html.parser")
    result = parse_enunciados_cls(soup)
    assert len(result) == 1
    assert result[0]["ramo"] == "DIREITO PROCESSUAL PENAL"


def test_parse_enunciados_cls_campos_corretos():
    from scripts.informativos_stj import parse_enunciados_cls
    soup = BeautifulSoup(FIXTURE_886, "html.parser")
    e = parse_enunciados_cls(soup)[0]
    assert "AgRg no REsp 2.000.001-SP" in e["processo"]
    assert "Habeas corpus" in e["tema"]
    assert "excesso de prazo" in e["destaque"].lower()


def test_extrair_data_do_titulo():
    from scripts.informativos_stj import extrair_data_titulo
    soup = BeautifulSoup(FIXTURE_886, "html.parser")
    data = extrair_data_titulo(soup, 886)
    assert data == "28 de abril de 2026"


def test_extrair_data_titulo_nao_encontrada():
    from scripts.informativos_stj import extrair_data_titulo
    soup = BeautifulSoup("<html><head><title>Sem data</title></head></html>", "html.parser")
    data = extrair_data_titulo(soup, 886)
    assert data == "Data não identificada"
