@echo off
cd /d "%~dp0"
echo Iniciando vitrine UAUVEXA em http://localhost:4177
start "" http://localhost:4177
node server.js
