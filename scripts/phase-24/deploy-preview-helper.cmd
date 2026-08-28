@echo off
REM PHASE 24.4 Vercel Preview deploy helper for the operator.
REM This script is NOT run by the agent. It is provided so the
REM operator can complete PHASE 24.4 once the required credentials
REM are present in their secure runtime environment.

setlocal

if not exist "C:\SACA\SACA-3.0-final-production-closeout" (
  echo ERROR: canonical source not found.
  exit /b 1
)

set "VC=C:\Users\Hamed Rabie\AppData\Local\Temp\kilo\vercel-cli\node_modules\.bin\vercel.cmd"
if not exist "%VC%" (
  echo ERROR: Vercel CLI not found. Run: npm install --no-audit --no-fund --prefix C:\Users\Hamed Rabie\AppData\Local\Temp\kilo\vercel-cli vercel@latest
  exit /b 1
)

set "PRJ=C:\SACA\SACA-3.0-final-production-closeout"
set "GIT_SHA="
for /f "delims=" %%i in ('"%GIT%" -C "%PRJ%" rev-parse HEAD 2^>nul') do set "GIT_SHA=%%i"
if "%GIT_SHA%"=="" (
  echo ERROR: no git commit. Run: git init ^&^& git add -A ^&^& git commit
  exit /b 1
)

echo.
echo ===========================================================
echo SACA 3.0 PHASE 24.4 Vercel Preview Deploy
echo.
echo Project:        %PRJ%
echo Commit:         %GIT_SHA%
echo.
echo STEP 1: login
echo.
echo   vercel login
echo.
echo STEP 2: link the canonical repo
echo.
echo   cd /d "%PRJ%"
echo   vercel link
echo.
echo STEP 3: set environment variables (Preview only)
echo.
echo   vercel env add DATABASE_URL preview
echo   vercel env add DIRECT_URL preview
echo   vercel env add ADMIN_USERNAME preview
echo   vercel env add ADMIN_ROLE preview
echo   vercel env add ADMIN_PASSWORD_HASH preview
echo   vercel env add ADMIN_SESSION_SECRET preview
echo   vercel env add MFA_ENCRYPTION_KEY preview
echo   vercel env add ELECTION_ENCRYPTION_KEY preview
echo   vercel env add NEXT_PUBLIC_BASE_URL preview
echo.
echo Optional:
echo   vercel env add LIVEKIT_URL preview
echo   vercel env add LIVEKIT_API_KEY preview
echo   vercel env add LIVEKIT_API_SECRET preview
echo   vercel env add LIVEKIT_WEBHOOK_SECRET preview
echo   vercel env add REDIS_URL preview
echo   vercel env add RESEND_API_KEY preview
echo   vercel env add EMAIL_FROM preview
echo   vercel env add TWILIO_ACCOUNT_SID preview
echo   vercel env add TWILIO_AUTH_TOKEN preview
echo   vercel env add TWILIO_VERIFY_SERVICE_SID preview
echo   vercel env add STRIPE_SECRET_KEY preview
echo   vercel env add STRIPE_WEBHOOK_SECRET preview
echo   vercel env add NEXT_PUBLIC_VAPID_PUBLIC_KEY preview
echo   vercel env add VAPID_PRIVATE_KEY preview
echo   vercel env add VAPID_SUBJECT preview
echo.
echo STEP 4: deploy Preview
echo.
echo   vercel deploy --yes
echo.
echo STEP 5: capture the Preview URL and run the smoke test
echo.
echo   scripts\phase-24\preview-smoke.mjs <preview-url>
echo.
echo STEP 6: in the Vercel dashboard, enable Deployment Protection
echo   for Preview (Standard Protection with password).
echo.
echo ===========================================================
echo.

endlocal
