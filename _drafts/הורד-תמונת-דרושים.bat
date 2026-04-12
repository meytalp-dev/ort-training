@echo off
chcp 65001 >nul
echo מצלם את מודעת הדרושים...
python "%~dp0capture-job-card.py"
pause
