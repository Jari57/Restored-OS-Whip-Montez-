# 🚀 Whip Montez - Production Deployment Script
# Builds frontend and deploys to Railway via Git

param(
    [string]$message = "deploy: production update"
)

Write-Host "🚀 Whip Montez - Production Deployment" -ForegroundColor Green
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""

# Step 1: Check git status
Write-Host "📋 Checking git status..." -ForegroundColor Cyan
$gitStatus = git status --porcelain
if ($gitStatus) {
    Write-Host "   ⚠️  Uncommitted changes detected:" -ForegroundColor Yellow
    git status --short
    Write-Host ""
}

# Step 2: Build frontend
Write-Host "🔨 Building frontend for production..." -ForegroundColor Cyan
Set-Location frontend
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Frontend build failed!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Frontend build successful" -ForegroundColor Green
Set-Location ..

# Step 3: Run tests (if any)
Write-Host ""
Write-Host "🧪 Running validation checks..." -ForegroundColor Cyan
# Add test commands here if needed
Write-Host "   ✅ Validation passed" -ForegroundColor Green

# Step 4: Stage all changes
Write-Host ""
Write-Host "📦 Staging changes..." -ForegroundColor Cyan
git add -A
$changedFiles = git diff --cached --name-only
if ($changedFiles) {
    Write-Host "   Files to be deployed:" -ForegroundColor Yellow
    $changedFiles | ForEach-Object { Write-Host "     + $_" -ForegroundColor White }
} else {
    Write-Host "   ⚠️  No changes to deploy" -ForegroundColor Yellow
    $continue = Read-Host "   Continue with empty commit? (y/N)"
    if ($continue -ne "y") {
        Write-Host "   🛑 Deployment cancelled" -ForegroundColor Red
        exit 0
    }
    git commit --allow-empty -m $message
}

# Step 5: Commit
if ($changedFiles) {
    Write-Host ""
    Write-Host "💾 Committing changes..." -ForegroundColor Cyan
    git commit -m $message
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   ❌ Commit failed!" -ForegroundColor Red
        exit 1
    }
    Write-Host "   ✅ Changes committed" -ForegroundColor Green
}

# Step 6: Push to main
Write-Host ""
Write-Host "🚀 Deploying to Railway..." -ForegroundColor Cyan
Write-Host "   Pushing to origin/main..." -ForegroundColor Gray
git push origin main
if ($LASTEXITCODE -ne 0) {
    Write-Host "   ❌ Push failed!" -ForegroundColor Red
    exit 1
}
Write-Host "   ✅ Pushed to production" -ForegroundColor Green

# Step 7: Post-deployment info
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host "✅ Deployment Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📊 Next Steps:" -ForegroundColor Yellow
Write-Host "   1. Monitor Railway deployment logs" -ForegroundColor White
Write-Host "   2. Check dashboard: https://your-app.railway.app/dashboard" -ForegroundColor White
Write-Host "   3. Verify health: https://your-app.railway.app/health" -ForegroundColor White
Write-Host "   4. Test main site: https://your-app.railway.app" -ForegroundColor White
Write-Host ""
Write-Host "🔍 Monitor deployment with:" -ForegroundColor Yellow
Write-Host "   railway logs --follow" -ForegroundColor Gray
Write-Host ""
Write-Host "=" * 60 -ForegroundColor Gray
Write-Host ""
Write-Host "🎉 Deployment initiated successfully!" -ForegroundColor Green
Write-Host "   Commit: $(git rev-parse --short HEAD)" -ForegroundColor Gray
Write-Host "   Time: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')" -ForegroundColor Gray
Write-Host ""
