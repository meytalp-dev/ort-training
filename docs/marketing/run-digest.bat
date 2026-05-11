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
REM Date format: DD/MM/YYYY → extract correctly
set LOG_FILE=%LOG_DIR%\digest-%date:~6,4%-%date:~3,2%-%date:~0,2%.log

REM Create log dir if needed
if not exist "%LOG_DIR%" mkdir "%LOG_DIR%"

echo [%date% %time%] Starting digest wrapper >> "%LOG_FILE%"

REM Kill ALL previous digest python processes (not just old ones) — ensures clean slate
echo [%date% %time%] Killing any leftover python processes... >> "%LOG_FILE%"
powershell -Command "Get-Process python -ErrorAction SilentlyContinue | ForEach-Object { Write-Output ('Killing PID ' + $_.Id + ' from ' + $_.StartTime); Stop-Process -Id $_.Id -Force }" >> "%LOG_FILE%" 2>&1

REM Kill any Chrome process holding the ChromeDebug profile lock
echo [%date% %time%] Killing Chrome processes (profile cleanup)... >> "%LOG_FILE%"
powershell -Command "Get-Process chrome -ErrorAction SilentlyContinue | Where-Object { $_.CommandLine -like '*ChromeDebug*' } | ForEach-Object { Write-Output ('Killing Chrome PID ' + $_.Id); Stop-Process -Id $_.Id -Force }" >> "%LOG_FILE%" 2>&1
REM Remove stale SingletonLock from profile dir (survives crashes)
if exist "C:\Users\meyta\ChromeDebug\SingletonLock" del /F /Q "C:\Users\meyta\ChromeDebug\SingletonLock" >> "%LOG_FILE%" 2>&1
if exist "C:\Users\meyta\ChromeDebug\SingletonCookie" del /F /Q "C:\Users\meyta\ChromeDebug\SingletonCookie" >> "%LOG_FILE%" 2>&1
if exist "C:\Users\meyta\ChromeDebug\SingletonSocket" del /F /Q "C:\Users\meyta\ChromeDebug\SingletonSocket" >> "%LOG_FILE%" 2>&1

REM Run the actual digest script with HARD 20-min timeout (kills process if hung)
echo [%date% %time%] Running digest script (20-min timeout)... >> "%LOG_FILE%"
powershell -Command "$p = Start-Process -FilePath '%PYTHON%' -ArgumentList '-u','%SCRIPT%' -NoNewWindow -PassThru -RedirectStandardOutput '%LOG_FILE%.out' -RedirectStandardError '%LOG_FILE%.err'; if (-not $p.WaitForExit(1200000)) { Write-Output 'TIMEOUT after 20 min — killing process'; Stop-Process -Id $p.Id -Force; exit 124 } else { exit $p.ExitCode }" >> "%LOG_FILE%" 2>&1
set EXIT_CODE=%ERRORLEVEL%

REM Merge stdout/stderr into main log
if exist "%LOG_FILE%.out" type "%LOG_FILE%.out" >> "%LOG_FILE%" 2>nul & del /F /Q "%LOG_FILE%.out" 2>nul
if exist "%LOG_FILE%.err" type "%LOG_FILE%.err" >> "%LOG_FILE%" 2>nul & del /F /Q "%LOG_FILE%.err" 2>nul

echo [%date% %time%] Digest finished with exit code %EXIT_CODE% >> "%LOG_FILE%"

REM Clean up old logs (keep 14 days)
forfiles /P "%LOG_DIR%" /M "digest-*.log" /D -14 /C "cmd /c del @path" 2>nul

exit /b %EXIT_CODE%
