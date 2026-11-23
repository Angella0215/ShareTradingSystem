# Starts API and React development server in separate Windows PowerShell windows.
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
if (-not (Test-Path (Join-Path $root 'backend\node_modules'))) { throw 'Run setup.ps1 first.' }
if (-not (Test-Path (Join-Path $root 'frontend\node_modules'))) { throw 'Run setup.ps1 first.' }
Start-Process powershell.exe -WorkingDirectory (Join-Path $root 'backend') -ArgumentList @('-NoExit','-NoProfile','-Command','npm run dev')
Start-Process powershell.exe -WorkingDirectory (Join-Path $root 'frontend') -ArgumentList @('-NoExit','-NoProfile','-Command','npm run dev')
Write-Host 'Opening http://localhost:5173' -ForegroundColor Green
Start-Process 'http://localhost:5173'
