#!/usr/bin/env pwsh
<#
.SYNOPSIS
  UI Inspector — Four-Layer Iterative Quality Gate for DM CRM.

.DESCRIPTION
  Runs all four inspection layers in sequence after a Vercel deploy.
  On any BLOCK, generates an Aider repair brief, reruns Aider, redeploys,
  and retries that layer. Promotes to production only after a full PASS.

  Layer order (free/unlimited first, paid/limited last):
    L1 — Smoke    Playwright HTTP (free, unlimited, ~30s)
    L2 — VR       pixelmatch visual regression (free, unlimited, ~3m)
    L3 — A11y     axe-core via Playwright (free, unlimited, ~2m)
    L4 — Personas decorative-walk + 10k journey matrix (~10m)

.PARAMETER DeployUrl
  The Vercel preview URL to inspect (e.g. https://designersmeet-crm-backend-xxx.vercel.app).
  If omitted, uses the branch alias for claude/confident-archimedes-a4d918.

.PARAMETER MaxRoundsPerLayer
  Max Aider repair iterations per layer before giving up (default: 3).

.PARAMETER SkipPromotion
  Run inspection only — do not promote to production even on PASS.

.PARAMETER LayersToRun
  Comma-separated subset to run, e.g. "1,3" to run only smoke + a11y.
  Default: all (1,2,3,4).

.EXAMPLE
  # Full run after a git push:
  .\ui-inspector-run.ps1

  # Inspect a specific preview URL, skip promotion:
  .\ui-inspector-run.ps1 -DeployUrl https://myapp-abc123.vercel.app -SkipPromotion

  # Run only smoke + a11y (fast CI mode):
  .\ui-inspector-run.ps1 -LayersToRun "1,3"
#>
param(
  [string]$DeployUrl = "https://designersmeet-crm-backend-git-c-d68037-smanishuk-2779s-projects.vercel.app",
  [int]$MaxRoundsPerLayer = 3,
  [switch]$SkipPromotion,
  [string]$LayersToRun = "1,2,3,4"
)

Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$WT = $PSScriptRoot   # This script lives at the worktree root
$FE = Join-Path $WT "packages\frontend"
$TIMESTAMP = Get-Date -Format "yyyyMMdd-HHmmss"
$REPORT_DIR = Join-Path $WT "ui-inspector-reports\$TIMESTAMP"
New-Item -ItemType Directory -Force -Path $REPORT_DIR | Out-Null

$ActiveLayers = $LayersToRun -split "," | ForEach-Object { $_.Trim() }

# ─────────────────────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────────────────────

function Write-Layer { param([string]$Msg) Write-Host "`n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan; Write-Host "  $Msg" -ForegroundColor Cyan; Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Cyan }
function Write-Pass { param([string]$Msg) Write-Host "  ✅ PASS — $Msg" -ForegroundColor Green }
function Write-Block { param([string]$Msg) Write-Host "  🚨 BLOCK — $Msg" -ForegroundColor Red }
function Write-Info { param([string]$Msg) Write-Host "  ℹ  $Msg" -ForegroundColor Gray }

function Invoke-PlaywrightLayer {
  param([string]$Config, [string]$Label, [hashtable]$Env = @{})
  Push-Location $FE
  try {
    $envArgs = $Env.GetEnumerator() | ForEach-Object { "$($_.Key)=$($_.Value)" }
    $fullEnv = @{ DEPLOY_URL = $DeployUrl } + $Env

    foreach ($kv in $fullEnv.GetEnumerator()) { [System.Environment]::SetEnvironmentVariable($kv.Key, $kv.Value) }

    $result = npx playwright test --config=$Config --reporter=json 2>&1
    $exitCode = $LASTEXITCODE

    # Save raw output
    $result | Out-File -FilePath (Join-Path $REPORT_DIR "$Label-raw.txt") -Encoding utf8

    return $exitCode -eq 0
  } finally {
    Pop-Location
  }
}

function Read-SmokeReport {
  $path = Join-Path $FE "tests\smoke-results\smoke-report.json"
  if (Test-Path $path) { return Get-Content $path | ConvertFrom-Json }
  return $null
}

function Read-A11yReport {
  $path = Join-Path $FE "tests\a11y-results\a11y-report.json"
  if (Test-Path $path) { return Get-Content $path | ConvertFrom-Json }
  return $null
}

function Build-AiderRepairPrompt {
  param([string]$Layer, [object]$Report)
  $issues = switch ($Layer) {
    "smoke" {
      $blocked = $Report.blocked
      ($blocked | ForEach-Object { "- $($_.reason)" }) -join "`n"
    }
    "a11y" {
      $blocked = $Report.blocked
      ($blocked | ForEach-Object {
        $page = $_
        $violations = $page.violations | Where-Object { $_.impact -in @("critical","serious") }
        ($violations | ForEach-Object { "- [$($_.impact.ToUpper())] $($page.route): $($_.description) — node: $($_.nodes[0])" }) -join "`n"
      }) -join "`n"
    }
    "vr" {
      "Visual regression failures detected — check tests/.vr-out/ for diff images. Fix layout changes that moved pixels."
    }
    "personas" {
      "Decorative element failures or broken journey steps detected. Check tests/ux-results/ for details."
    }
    default { "Unknown layer failures." }
  }

  return @"
UI Inspector BLOCK on layer: $Layer

Issues to fix:
$issues

Instructions:
1. Fix ONLY the listed issues. Do not change any visual layout, colors, fonts, or spacing.
2. Do not remove any existing functionality.
3. After fixing, run `npm run build` to verify it compiles.
4. Do not add new dependencies.
5. All fixes must be in packages/frontend/src/ or packages/backend/src/.
"@
}

function Invoke-AiderFix {
  param([string]$Prompt, [string]$Layer)
  Write-Info "Running Aider to fix $Layer issues..."

  $promptFile = Join-Path $REPORT_DIR "aider-prompt-$Layer.md"
  $Prompt | Out-File -FilePath $promptFile -Encoding utf8

  Push-Location $WT
  try {
    # Run Aider with the repair prompt
    # Uses the same model pairing as the main Aider pipeline
    $result = aider `
      --model claude-sonnet-4-5 `
      packages/frontend/src `
      packages/backend/src `
      --message-file $promptFile `
      --no-auto-commits `
      2>&1

    $result | Out-File -FilePath (Join-Path $REPORT_DIR "aider-$Layer-output.txt") -Encoding utf8
    return $LASTEXITCODE -eq 0
  } finally {
    Pop-Location
  }
}

function Invoke-Deploy {
  Write-Info "Pushing changes and waiting for Vercel build..."
  Push-Location $WT
  try {
    git -c http.sslVerify=false add -A
    $msg = "fix(ui-inspector): automated repair round $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
    git -c http.sslVerify=false commit -m $msg --allow-empty
    git -c http.sslVerify=false push origin claude/confident-archimedes-a4d918

    Write-Info "Waiting 90 seconds for Vercel Lambda warm-up..."
    Start-Sleep -Seconds 90
  } finally {
    Pop-Location
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# Main Inspection Loop
# ─────────────────────────────────────────────────────────────────────────────

$globalVerdict = "PASS"
$layerResults = @{}

Write-Host "`n🔍 UI INSPECTOR — Four-Layer Pre-Ship Gate" -ForegroundColor Magenta
Write-Host "   App: $DeployUrl" -ForegroundColor Gray
Write-Host "   Layers: $LayersToRun | Max rounds/layer: $MaxRoundsPerLayer`n" -ForegroundColor Gray

# ── Layer 1: Smoke Tests (HTTP — free, unlimited, ~30s) ─────────────────────
if ("1" -in $ActiveLayers) {
  Write-Layer "Layer 1 — Endpoint Smoke Tests (HTTP)"
  $round = 0
  $l1Pass = $false

  while ($round -lt $MaxRoundsPerLayer -and -not $l1Pass) {
    $round++
    Write-Info "Round $round/$MaxRoundsPerLayer"

    $l1Pass = Invoke-PlaywrightLayer -Config "playwright.smoke.config.ts" -Label "smoke-r$round"
    $report = Read-SmokeReport

    if ($l1Pass) {
      Write-Pass "All API endpoints healthy"
      $layerResults["L1"] = "PASS"
    } else {
      Write-Block "Smoke failures detected"
      if ($report) {
        $report.blocked | ForEach-Object { Write-Host "    • $($_.reason)" -ForegroundColor Yellow }
      }
      if ($round -lt $MaxRoundsPerLayer) {
        $prompt = Build-AiderRepairPrompt -Layer "smoke" -Report $report
        $fixed = Invoke-AiderFix -Prompt $prompt -Layer "smoke-r$round"
        if ($fixed) { Invoke-Deploy }
      }
    }
  }

  if (-not $l1Pass) {
    Write-Block "Layer 1 FAILED after $MaxRoundsPerLayer rounds — stopping pipeline"
    $layerResults["L1"] = "BLOCK"
    $globalVerdict = "BLOCK"
  }
}

# ── Layer 2: Visual Regression (pixelmatch — free, unlimited, ~3m) ──────────
if ("2" -in $ActiveLayers -and $globalVerdict -ne "BLOCK") {
  Write-Layer "Layer 2 — Visual Regression (pixelmatch)"
  $round = 0
  $l2Pass = $false

  while ($round -lt $MaxRoundsPerLayer -and -not $l2Pass) {
    $round++
    Write-Info "Round $round/$MaxRoundsPerLayer — running wiring + VR checks"

    $wirePas = Invoke-PlaywrightLayer -Config "playwright.config.ts" -Label "vr-wiring-r$round" `
      -Env @{ VR_BASELINE = "0" }

    $l2Pass = $wirePas

    if ($l2Pass) {
      Write-Pass "No visual regressions detected"
      $layerResults["L2"] = "PASS"
    } else {
      Write-Block "Visual regression detected — pixel diffs in tests/.vr-out/"
      if ($round -lt $MaxRoundsPerLayer) {
        $prompt = Build-AiderRepairPrompt -Layer "vr" -Report $null
        $fixed = Invoke-AiderFix -Prompt $prompt -Layer "vr-r$round"
        if ($fixed) { Invoke-Deploy }
      }
    }
  }

  if (-not $l2Pass) {
    $layerResults["L2"] = "BLOCK"
    $globalVerdict = "BLOCK"
    Write-Block "Layer 2 FAILED after $MaxRoundsPerLayer rounds"
  }
}

# ── Layer 3: Accessibility (axe-core — free, unlimited, ~2m) ────────────────
if ("3" -in $ActiveLayers -and $globalVerdict -ne "BLOCK") {
  Write-Layer "Layer 3 — Accessibility (axe-core WCAG 2.1 AA)"
  $round = 0
  $l3Pass = $false

  while ($round -lt $MaxRoundsPerLayer -and -not $l3Pass) {
    $round++
    Write-Info "Round $round/$MaxRoundsPerLayer"

    $l3Pass = Invoke-PlaywrightLayer -Config "playwright.a11y.config.ts" -Label "a11y-r$round"
    $report = Read-A11yReport

    if ($l3Pass) {
      Write-Pass "Zero critical/serious a11y violations"
      if ($report -and $report.totalModerate -gt 0) {
        Write-Info "$($report.totalModerate) moderate violations logged as tech debt"
      }
      $layerResults["L3"] = "PASS"
    } else {
      Write-Block "Accessibility violations detected"
      if ($report) {
        $report.blocked | ForEach-Object {
          $page = $_
          Write-Host "    $($page.route): $($page.critical) critical, $($page.serious) serious" -ForegroundColor Yellow
        }
      }
      if ($round -lt $MaxRoundsPerLayer) {
        $prompt = Build-AiderRepairPrompt -Layer "a11y" -Report $report
        $fixed = Invoke-AiderFix -Prompt $prompt -Layer "a11y-r$round"
        if ($fixed) { Invoke-Deploy }
      }
    }
  }

  if (-not $l3Pass) {
    $layerResults["L3"] = "BLOCK"
    $globalVerdict = "BLOCK"
    Write-Block "Layer 3 FAILED after $MaxRoundsPerLayer rounds"
  }
}

# ── Layer 4: Persona-Journey Matrix (Playwright — free, ~10m) ───────────────
if ("4" -in $ActiveLayers -and $globalVerdict -ne "BLOCK") {
  Write-Layer "Layer 4 — Persona-Journey Matrix + Decorative Walk"
  $round = 0
  $l4Pass = $false

  while ($round -lt $MaxRoundsPerLayer -and -not $l4Pass) {
    $round++
    Write-Info "Round $round/$MaxRoundsPerLayer — running decorative walk"

    # D-DECORATIVE probe (fast, ~2m)
    $decorPas = Invoke-PlaywrightLayer -Config "playwright.ux-decorative.config.ts" -Label "decorative-r$round"

    # Full 10k matrix (slow, ~10m) — only if decorative passes
    $journeyPas = $false
    if ($decorPas) {
      Write-Info "Decorative walk passed — running 10k journey matrix"
      $journeyPas = Invoke-PlaywrightLayer -Config "playwright.ux.config.ts" -Label "journeys-r$round"
    }

    $l4Pass = $decorPas -and $journeyPas

    if ($l4Pass) {
      Write-Pass "All persona journeys passed"
      $layerResults["L4"] = "PASS"
    } else {
      if (-not $decorPas) {
        Write-Block "Decorative elements found with no action — check tests/ux-results/"
      } else {
        Write-Block "Journey matrix failures — check tests/ux-results/"
      }
      if ($round -lt $MaxRoundsPerLayer) {
        $prompt = Build-AiderRepairPrompt -Layer "personas" -Report $null
        $fixed = Invoke-AiderFix -Prompt $prompt -Layer "personas-r$round"
        if ($fixed) { Invoke-Deploy }
      }
    }
  }

  if (-not $l4Pass) {
    $layerResults["L4"] = "BLOCK"
    $globalVerdict = "BLOCK"
    Write-Block "Layer 4 FAILED after $MaxRoundsPerLayer rounds"
  }
}

# ─────────────────────────────────────────────────────────────────────────────
# Final Report
# ─────────────────────────────────────────────────────────────────────────────

$finalReport = @{
  timestamp = (Get-Date -Format "o")
  deployUrl = $DeployUrl
  layers = $layerResults
  verdict = $globalVerdict
}
$finalReport | ConvertTo-Json -Depth 5 | Out-File -FilePath (Join-Path $REPORT_DIR "final-report.json") -Encoding utf8

Write-Host "`n" + ("─" * 50) -ForegroundColor $(if ($globalVerdict -eq "PASS") {"Green"} else {"Red"})
Write-Host "  UI INSPECTOR: $globalVerdict" -ForegroundColor $(if ($globalVerdict -eq "PASS") {"Green"} else {"Red"})
$layerResults.GetEnumerator() | Sort-Object Key | ForEach-Object {
  $color = if ($_.Value -eq "PASS") {"Green"} else {"Red"}
  Write-Host "    $($_.Key): $($_.Value)" -ForegroundColor $color
}
Write-Host ("─" * 50) -ForegroundColor $(if ($globalVerdict -eq "PASS") {"Green"} else {"Red"})
Write-Host "  Report: $REPORT_DIR`n" -ForegroundColor Gray

# ── Promote to Production ────────────────────────────────────────────────────
if ($globalVerdict -eq "PASS" -and -not $SkipPromotion) {
  Write-Host "  🚀 Promoting to production..." -ForegroundColor Magenta
  # Get the latest deployment ID via Vercel MCP or API
  # For now, output the manual step clearly
  Write-Host @"

  Manual promotion required (vercel CLI not in PATH due to Norton AV):
    1. Go to: https://vercel.com/smanishuk-2779s-projects/designersmeet-crm-backend/deployments
    2. Find the latest deployment from claude/confident-archimedes-a4d918
    3. Click ... → Promote to Production

  Or wire this up once vercel CLI is available:
    vercel promote <deployment-id> --token `$env:VERCEL_TOKEN --scope team_yze6KFOP792mMfampVb6mbGq

"@ -ForegroundColor Cyan
} elseif ($globalVerdict -eq "BLOCK") {
  Write-Host "  ❌ NOT promoting — inspection failed. Check $REPORT_DIR for details.`n" -ForegroundColor Red
  exit 1
}
