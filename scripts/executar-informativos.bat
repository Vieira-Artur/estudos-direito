@echo off
cd /d C:\Users\artur\Documents\estudos-direito
if not exist logs mkdir logs
python scripts\informativos_stj.py >> logs\informativos.log 2>&1
