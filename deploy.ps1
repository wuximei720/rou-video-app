Write-Host "=== Railway Deployment Script ===" -ForegroundColor Cyan

Write-Host "`n1. Logging in to Railway..." -ForegroundColor Yellow
railway login

Write-Host "`n2. Checking login status..." -ForegroundColor Yellow
railway project list

Write-Host "`n3. Linking to project..." -ForegroundColor Yellow
railway link --project rou-video-app

Write-Host "`n4. Deploying..." -ForegroundColor Yellow
railway up

Write-Host "`n=== Deployment Complete ===" -ForegroundColor Green
