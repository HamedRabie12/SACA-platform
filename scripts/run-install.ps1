Set-Location -LiteralPath "C:\SACA\SACA-3.0-final-production-closeout"
$ts = Get-Date -Format "HH:mm:ss"
"[$ts] START npm install" | Out-File -FilePath "logs\npm-install.log" -Encoding utf8 -Append
npm install --no-audit --no-fund 2>&1 | ForEach-Object {
    $line = "[$((Get-Date -Format 'HH:mm:ss'))] $_"
    Write-Host $line
    $line | Out-File -FilePath "logs\npm-install.log" -Encoding utf8 -Append
}
"[$((Get-Date -Format 'HH:mm:ss'))] EXITCODE=$LASTEXITCODE" | Out-File -FilePath "logs\npm-install.log" -Encoding utf8 -Append
