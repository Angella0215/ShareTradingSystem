# Run with: powershell -NoProfile -ExecutionPolicy Bypass -File .\setup.ps1
$ErrorActionPreference = 'Stop'
$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $root
if (-not (Get-Command node -ErrorAction SilentlyContinue)) { throw 'Install Node.js 20 or later first: https://nodejs.org/' }
if (-not (Get-Command npm -ErrorAction SilentlyContinue)) { throw 'npm is missing. Install Node.js.' }
Write-Host 'SML React / Express / Neon setup' -ForegroundColor Cyan
$envPath = Join-Path $root 'backend\.env'
if (-not (Test-Path $envPath)) {
  Write-Host 'Create a Neon project at https://console.neon.tech and copy its PostgreSQL connection string.'
  $connection = Read-Host 'Paste your Neon PostgreSQL connection string (postgresql://...)'
  if (-not ($connection -match '^postgres(ql)?://')) { throw 'A valid Neon connection string is required to import your database.' }
  $bytes = New-Object byte[] 48
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  $rng.GetBytes($bytes)
  $rng.Dispose()
  $secret = [Convert]::ToBase64String($bytes)
  @"
DATABASE_URL=$connection
JWT_SECRET=$secret
PORT=5000
CLIENT_URL=http://localhost:5173
EMAIL_USER=
EMAIL_APP_PASSWORD=
GOOGLE_CLIENT_ID=
"@ | Set-Content -Encoding UTF8 -Path $envPath
  Write-Host 'Created backend/.env with your private connection string and a secure JWT secret.' -ForegroundColor Green
} else {
  Write-Host 'Using existing backend/.env without changing it.' -ForegroundColor Yellow
}
Write-Host 'Installing backend packages...'
npm install --prefix backend
if ($LASTEXITCODE -ne 0) { throw 'Backend npm install failed.' }
Write-Host 'Installing frontend packages...'
npm install --prefix frontend
if ($LASTEXITCODE -ne 0) { throw 'Frontend npm install failed.' }
Write-Host 'Creating PostgreSQL database schema...'
npm run db:setup --prefix backend
if ($LASTEXITCODE -ne 0) { throw 'Database schema setup failed. Check DATABASE_URL, Neon project status and network access.' }
$restore = Read-Host 'Restore the original 18 Oct 2026 MySQL snapshot data into Neon? [Y/n]'
if ($restore -notmatch '^[Nn]') {
  npm run db:import --prefix backend
  if ($LASTEXITCODE -ne 0) { throw 'Data import failed. Your source JSON remains safe and can be re-imported.' }
}
Write-Host ''
Write-Host 'Setup complete. Start the application with: powershell -NoProfile -ExecutionPolicy Bypass -File .\start.ps1' -ForegroundColor Green
Write-Host 'If you need a new admin login: cd backend; npm run user:create'
