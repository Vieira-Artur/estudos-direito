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


def test_parse_enunciados_cls_retorna_todos_os_blocos():
    from scripts.informativos_stj import parse_enunciados_cls
    soup = BeautifulSoup(FIXTURE_886, "html.parser")
    result = parse_enunciados_cls(soup)
    assert len(result) == 2
    ramos = {e["ramo"] for e in result}
    assert "DIREITO PROCESSUAL PENAL" in ramos
    assert "DIREITO ADMINISTRATIVO" in ramos


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


def test_render_card_tem_wrapper_e_numero():
    from scripts.informativos_stj import _render_card
    e = {
        "processo": "AgRg no HC 123-SP",
        "link": "",
        "ramo": "DIREITO PROCESSUAL PENAL",
        "tema": "Tema do julgado.",
        "destaque": "O STJ decidiu que X.",
    }
    html = _render_card(e, 2)
    assert 'class="inf-card-wrap"' in html
    assert 'class="inf-num"' in html
    assert ">2<" in html


def test_render_card_destaque_antes_de_processo():
    from scripts.informativos_stj import _render_card
    e = {
        "processo": "AgRg no HC 123-SP",
        "link": "",
        "ramo": "DIREITO PROCESSUAL PENAL",
        "tema": "Tema.",
        "destaque": "O STJ decidiu que X.",
    }
    html = _render_card(e, 1)
    pos_destaque = html.index("inf-destaque")
    pos_processo = html.index("inf-processo")
    assert pos_destaque < pos_processo, "destaque deve aparecer antes do processo no HTML"


def test_render_card_sem_card_head():
    from scripts.informativos_stj import _render_card
    e = {
        "processo": "AgRg no HC 123-SP",
        "link": "",
        "ramo": "DIREITO PROCESSUAL PENAL",
        "tema": "Tema.",
        "destaque": "O STJ decidiu que X.",
    }
    html = _render_card(e, 1)
    assert "inf-card-head" not in html


def test_render_card_rodape_tem_processo_e_ramo():
    from scripts.informativos_stj import _render_card
    e = {
        "processo": "AgRg no HC 123-SP",
        "link": "",
        "ramo": "DIREITO PROCESSUAL PENAL",
        "tema": "Tema.",
        "destaque": "O STJ decidiu que X.",
    }
    html = _render_card(e, 1)
    assert 'class="inf-card-foot"' in html
    assert "AgRg no HC 123-SP" in html
    assert "DIREITO PROCESSUAL PENAL" in html


# ---- testes de regex e MATERIAS ----------------------------------------

def test_regex_proc_penal_exclui_somente_militar():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["processual-penal"]["ramo_regex"]
    assert not regex.search("DIREITO PROCESSUAL PENAL MILITAR")


def test_regex_proc_penal_inclui_misto():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["processual-penal"]["ramo_regex"]
    assert regex.search("DIREITO PENAL MILITAR, DIREITO PROCESSUAL PENAL, DIREITO PROCESSUAL PENAL MILITAR")


def test_regex_penal_exclui_somente_militar():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["penal"]["ramo_regex"]
    assert not regex.search("DIREITO PENAL MILITAR")


def test_regex_penal_nao_bate_processual_penal():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["penal"]["ramo_regex"]
    assert not regex.search("DIREITO PROCESSUAL PENAL")


def test_regex_penal_inclui_penal_puro():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["penal"]["ramo_regex"]
    assert regex.search("DIREITO PENAL")


def test_regex_penal_inclui_misto_com_processual():
    from scripts.informativos_stj import MATERIAS
    regex = MATERIAS["penal"]["ramo_regex"]
    assert regex.search("DIREITO PENAL, DIREITO PROCESSUAL PENAL")
