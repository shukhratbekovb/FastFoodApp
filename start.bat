@echo off

REM --- Ожидание запуска Rancher Desktop Docker Engine ---
echo Waiting for Docker Engine from Rancher Desktop...
:check
docker info >nul 2>&1
IF %ERRORLEVEL% NEQ 0 (
    timeout /t 3 >nul
    goto check
)

REM --- Перезапуск контейнеров ---
docker-compose down
docker-compose up --build -d

REM --- Ожидание перед открытием браузера ---
timeout /t 6 >nul

REM --- Открытие Chrome ---
start "" "C:\Program Files\Google\Chrome\Application\chrome.exe" http://localhost:3000/catalog

REM --- Подождать чтобы окно появилось ---
timeout /t 2 >nul

REM --- Авто-нажатие F11 ---
powershell -command "(new-object -com wscript.shell).SendKeys('{F11}')"

exit
