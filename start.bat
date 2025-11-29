@echo off

REM --- Запуск Docker Desktop ---
start "" "C:\Program Files\Docker\Docker\Docker Desktop.exe"

REM --- Ожидание старта Docker Engine ---
:wait
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    timeout /t 3 >nul
    goto wait
)

REM --- Перезапуск контейнеров ---
docker-compose down
docker-compose up --build -d

REM --- Ожидание перед открытием браузера ---
timeout /t 6 >nul


REM --- Открытие браузера ---
start  http://localhost:3000/catalog

REM Подождать 2 секунды пока окно откроется
timeout /t 2 >nul

REM Отправить F11 в активное окно
powershell -command "(new-object -com wscript.shell).SendKeys('{F11}')"

exit
