Set-Location -LiteralPath "C:\SACA\SACA-3.0-final-production-closeout"
$env:NODE_ENV = "production"
$env:DATABASE_URL = "postgresql://postgres:SacaDev2026!@127.0.0.1:5432/saca?schema=public"
$env:DIRECT_URL = "postgresql://postgres:SacaDev2026!@127.0.0.1:5432/saca?schema=public"
$env:ADMIN_USERNAME = "saca.admin"
$env:ADMIN_ROLE = "SUPER_ADMIN"
$env:ADMIN_SESSION_SECRET = "this-is-a-32-or-more-character-development-only-secret-do-not-use-in-prod-1234567890"
$env:MFA_ENCRYPTION_KEY = "dev-only-32byte-mfa-key-not-for-prod-abcdef0123456789"
$env:ELECTION_ENCRYPTION_KEY = "dev-only-32byte-enc-key-not-for-prod-fedcba9876543210"
$env:NEXT_PUBLIC_BASE_URL = "http://localhost:3001"
$env:PORT = "3001"
$env:VERCEL_ENV = "preview"
$env:DEV_OTP_ENABLED = "true"
$env:ALLOW_CONTROLLED_DATA_OPERATIONS = "true"
$ts = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
"[$ts] START preview-mode server on port 3001" | Out-File -FilePath "logs\phase-24\24.4-preview-server.log" -Encoding utf8 -Append
node .next/standalone/server.js 2>&1 | ForEach-Object {
  $line = "[$((Get-Date -Format 'HH:mm:ss'))] $_"
  Write-Host $line
  $line | Out-File -FilePath "logs\phase-24\24.4-preview-server.log" -Encoding utf8 -Append
}
