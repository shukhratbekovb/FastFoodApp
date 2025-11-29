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

REM --- Открытие браузера ---
start http://localhost:3000/catalog

exit
