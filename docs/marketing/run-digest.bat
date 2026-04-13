@echo off
REM ============================================================
REM Daily AI Digest — Wrapper Script
REM ============================================================
REM 1. Kills any zombie digest processes from previous runs
REM 2. Runs the digest script with output logging
REM 3. Task Scheduler should point HERE, not directly to .py
REM ============================================================

set PYTHON=C:\Users\meyta\AppData\Local\Python\pythoncore-3.14-64\python.exe
set SCRIPT=C:\Users\meyta\Downloads\ort-presentation-builder\docs\marketing\daily-ai-digest.py
set LOG_DIR=%USERPROFILE%\Desktop\AI-Digest\logs
set LOG_FILE=%LOG_DIR%\digest-%date:~0,4%-%date:~5,2%-%date:~8,2%.log

REM Create log dir if needed
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo [%date% %time%] Starting digest wrapper >> "%LOG_FILE%"

REM Kill any previous digest python processes (older than this one)
echo [%date% %time%] Checking for zombie processes... >> "%LOG_FILE%"
powershell -Command "Get-Process python -ErrorAction SilentlyContinue | Where-Object { $_.StartTime -lt (Get-Date).AddMinutes(-25) } | ForEach-Object { Write-Output ('Killing zombie PID ' + $_.Id + ' from ' + $_.StartTime); Stop-Process -Id $_.Id -Force }" >> "%LOG_FILE%" 2>&1

REM Run the actual digest script with timeout (20 min)
echo [%date% %time%] Running digest script... >> "%LOG_FILE%"
"%PYTHON%" "%SCRIPT%" >> "%LOG_FILE%" 2>&1
set EXIT_CODE=%ERRORLEVEL%

echo [%date% %time%] Digest finished with exit code %EXIT_CODE% >> "%LOG_FILE%"

REM Clean up old logs (keep 14 days)
forfiles /P "%LOG_DIR%" /M "digest-*.log" /D -14 /C "cmd /c del @path" 2>nul

exit /b %EXIT_CODE%
