@echo off
cd /d C:\Users\artur\Documents\estudos-direito
if not exist logs mkdir logs
python scripts\informativos_stj.py --materia processual-penal >> logs\informativos.log 2>&1
python scripts\informativos_stj.py --materia penal >> logs\informativos.log 2>&1
python scripts\informativos_stj.py --materia tributario >> logs\informativos.log 2>&1
