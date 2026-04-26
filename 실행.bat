@echo off
cd /d "%~dp0"

echo 기존 서버를 종료합니다...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3000"') do taskkill /f /pid %%a >nul 2>&1
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":3001"') do taskkill /f /pid %%a >nul 2>&1

timeout /t 2 /nobreak > nul

if not exist "node_modules" (
  echo 패키지를 설치합니다 ^(최초 1회^)...
  npm install
)

echo 서버를 시작합니다...
start cmd /k "cd /d "%~dp0" && npm run dev"

timeout /t 6 /nobreak > nul
start http://localhost:3001
