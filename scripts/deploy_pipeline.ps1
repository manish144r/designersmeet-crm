# DesignersMeet CRM — Deploy Pipeline
# Runs: Aider (code fixes) → Codex (review gate) → Deploy
# Usage: .\scripts\deploy_pipeline.ps1

$ErrorActionPreference = "Stop"
$CrmRoot = Split-Path $PSScriptRoot -Parent

Write-Host "`n=== DESIGNERSMEET CRM DEPLOY PIPELINE ===" -ForegroundColor Gold
Write-Host "Working directory: $CrmRoot" -ForegroundColor DarkGray

# Step 0: Build shared package first
Write-Host "`n[0/5] Building shared package..." -ForegroundColor Cyan
Push-Location $CrmRoot
npm run build -w @dm/shared
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED: shared build" -ForegroundColor Red; exit 1 }

# Step 1: Full typecheck
Write-Host "`n[1/5] Running typecheck..." -ForegroundColor Cyan
npm run typecheck
if ($LASTEXITCODE -ne 0) {
    Write-Host "Typecheck FAILED — sending to Aider for fixes..." -ForegroundColor Yellow
    
    $errors = npm run typecheck 2>&1 | Out-String
    aider --model ollama/qwen2.5-coder:14b --no-auto-commits --message "Fix these TypeScript errors:`n$errors"
    
    # Re-check
    npm run typecheck
    if ($LASTEXITCODE -ne 0) { Write-Host "FAILED after Aider fix attempt" -ForegroundColor Red; exit 1 }
}
Write-Host "Typecheck PASSED" -ForegroundColor Green

# Step 2: Build all
Write-Host "`n[2/5] Building all packages..." -ForegroundColor Cyan
npm run build
if ($LASTEXITCODE -ne 0) { Write-Host "FAILED: build" -ForegroundColor Red; exit 1 }
Write-Host "Build PASSED" -ForegroundColor Green

# Step 3: Run tests
Write-Host "`n[3/5] Running tests..." -ForegroundColor Cyan
npm test 2>$null
# Tests are non-blocking for now (minimal coverage)
Write-Host "Tests complete" -ForegroundColor Green

# Step 4: Codex code review gate
Write-Host "`n[4/5] Codex code review..." -ForegroundColor Cyan
$review = claude -p @"
Review all source files in packages/backend/src and packages/frontend/src of this DesignersMeet CRM.
Focus on:
1. Type safety issues
2. Security vulnerabilities (auth bypass, injection)
3. Logic bugs
4. Missing error handling
5. Production readiness

For each issue: report file:line and severity (P0/P1/P2).
End with a clear VERDICT: PASS or FAIL.
If PASS, state "APPROVED FOR PRODUCTION".
"@ --dangerously-skip-permissions --output-format text --model sonnet

Write-Host $review

if ($review -match "FAIL|BLOCKED") {
    Write-Host "`nCodex REJECTED — sending issues to Aider..." -ForegroundColor Red
    aider --model ollama/qwen2.5-coder:14b --no-auto-commits --message "Codex code review found these issues. Fix them all:`n$review"
    
    Write-Host "`nRe-running Codex review..." -ForegroundColor Yellow
    # Re-run codex (manual for now — operator decides whether to loop)
    Write-Host "Run this script again after Aider fixes are applied." -ForegroundColor Yellow
    exit 1
}

Write-Host "`nCodex APPROVED" -ForegroundColor Green

# Step 5: Deploy confirmation
Write-Host "`n[5/5] Ready for deployment!" -ForegroundColor Green
Write-Host "Production build at: packages/frontend/dist/" -ForegroundColor DarkGray
Write-Host "Backend at: packages/backend/dist/server.js" -ForegroundColor DarkGray
Write-Host "`nTo deploy via PAC CLI:" -ForegroundColor Cyan
Write-Host "  pac pcf push --publisher-prefix dm" -ForegroundColor White

Pop-Location
