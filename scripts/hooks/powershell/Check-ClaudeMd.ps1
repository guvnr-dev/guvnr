<#
.SYNOPSIS
    CLAUDE.md Validation Hook for PowerShell

.DESCRIPTION
    Validates CLAUDE.md structure and content quality.
    Warns when significant code changes occur without CLAUDE.md updates.

.EXAMPLE
    .\Check-ClaudeMd.ps1

.NOTES
    Exit codes:
      0 - Success or warning only
      1 - Error (blocks commit)

    Part of Guvnr
    https://github.com/guvnr-dev/guvnr
#>

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Configuration
$ClaudeMdPath = 'CLAUDE.md'
$RequiredSections = @(
    '## Overview',
    '## Tech Stack',
    '## Current State'
)
$RecommendedSections = @(
    '## Architecture',
    '## Conventions',
    '## Common Commands',
    '## Session Instructions'
)
$MaxSizeKB = 100

$script:Warnings = 0
$script:Errors = 0

# Helper functions
function Write-Warning-Msg {
    param([string]$Message)
    Write-Host "⚠️  Warning: $Message" -ForegroundColor Yellow
    $script:Warnings++
}

function Write-Error-Msg {
    param([string]$Message)
    Write-Host "✗ Error: $Message" -ForegroundColor Red
    $script:Errors++
}

function Write-Success-Msg {
    param([string]$Message)
    Write-Host "✓ $Message" -ForegroundColor Green
}

function Write-Info-Msg {
    param([string]$Message)
    Write-Host "ℹ️  $Message" -ForegroundColor DarkGray
}

# Check if CLAUDE.md exists
if (-not (Test-Path $ClaudeMdPath)) {
    Write-Warning-Msg "CLAUDE.md not found in project root"
    Write-Info-Msg "Create with: npx guvnr init"
    exit 0
}

# Check file size
$fileInfo = Get-Item $ClaudeMdPath
$fileSizeKB = [math]::Round($fileInfo.Length / 1024, 2)

if ($fileSizeKB -gt $MaxSizeKB) {
    Write-Warning-Msg "CLAUDE.md is ${fileSizeKB}KB (recommended: <${MaxSizeKB}KB)"
    Write-Info-Msg "Large files may cause context issues. Consider splitting into separate docs."
}

# Safety limit for extremely large files
$MaxProcessSizeKB = 1024
if ($fileSizeKB -gt $MaxProcessSizeKB) {
    Write-Warning-Msg "CLAUDE.md is too large (${fileSizeKB}KB) to validate efficiently"
    Write-Info-Msg "Maximum processable size: ${MaxProcessSizeKB}KB"
    Write-Info-Msg "Consider splitting your documentation into smaller files"
    exit 0
}

# Read content
$content = Get-Content $ClaudeMdPath -Raw

# Check required sections
foreach ($section in $RequiredSections) {
    if ($content -notmatch "(?m)^$([regex]::Escape($section))") {
        Write-Warning-Msg "Missing required section: $section"
    }
}

# Check recommended sections
$missingRecommended = @()
foreach ($section in $RecommendedSections) {
    if ($content -notmatch "(?m)^$([regex]::Escape($section))") {
        $missingRecommended += $section
    }
}

if ($missingRecommended.Count -gt 0) {
    Write-Info-Msg "Consider adding: $($missingRecommended -join ', ')"
}

# Check for potential secrets
$secretPatterns = @(
    'password\s*[:=]\s*[''"][^''"]{8,}[''"]',
    'api[_-]?key\s*[:=]\s*[''"][^''"]{16,}[''"]',
    'secret\s*[:=]\s*[''"][^''"]{8,}[''"]',
    'sk-[a-zA-Z0-9]{32,}',
    'ghp_[a-zA-Z0-9]{36}',
    'gho_[a-zA-Z0-9]{36}',
    'glpat-[a-zA-Z0-9\-]{20}',
    'AKIA[0-9A-Z]{16}',
    '-----BEGIN (RSA |EC |DSA )?PRIVATE KEY-----'
)

foreach ($pattern in $secretPatterns) {
    if ($content -match $pattern) {
        Write-Error-Msg "Potential secret detected in CLAUDE.md!"
        Write-Info-Msg "Move secrets to environment variables or secret manager"
        break
    }
}

# Check for placeholder text
$placeholders = @(
    '\[Brief description',
    '\[specify\]',
    '\[Add decisions here\]',
    '\[Date\]: \[Decision'
)

$placeholderCount = 0
foreach ($pattern in $placeholders) {
    if ($content -match $pattern) {
        $placeholderCount++
    }
}

if ($placeholderCount -gt 2) {
    Write-Warning-Msg "Multiple placeholder texts found - consider filling them in"
}

# Check for stale "Current State" section
if ($content -match '## Current State') {
    if ($content -match '(initial setup|todo|placeholder|coming soon|\[add|\[specify|\[describe)') {
        Write-Info-Msg "Consider updating the 'Current State' section with actual status"
    }
}

# Check if significant code changes were made without updating CLAUDE.md
try {
    $null = git rev-parse --git-dir 2>$null
    if ($LASTEXITCODE -eq 0) {
        $codeExtensions = '\.(ts|tsx|js|jsx|py|go|rs|rb|java|kt|swift|c|cpp|h)$'
        $changedFiles = (git diff --cached --name-only 2>$null |
            Where-Object { $_ -match $codeExtensions }).Count
        $claudeModified = (git diff --cached --name-only 2>$null |
            Where-Object { $_ -eq 'CLAUDE.md' }).Count

        if ($changedFiles -gt 5 -and $claudeModified -eq 0) {
            Write-Warning-Msg "Significant code changes ($changedFiles files) without CLAUDE.md update"
            Write-Info-Msg "Consider updating the 'Current State' section"
        }

        $newFiles = (git diff --cached --name-only --diff-filter=A 2>$null).Count
        if ($newFiles -gt 3 -and $claudeModified -eq 0) {
            Write-Info-Msg "Multiple new files added - consider documenting in CLAUDE.md"
        }
    }
}
catch {
    # Not in a git repository or git not available
}

# Summary
Write-Host ""
if ($script:Errors -gt 0) {
    Write-Host "CLAUDE.md validation failed with $($script:Errors) error(s)" -ForegroundColor Red
    Write-Host "To skip this check: git commit --no-verify"
    exit 1
}
elseif ($script:Warnings -gt 0) {
    Write-Host "CLAUDE.md validation passed with $($script:Warnings) warning(s)" -ForegroundColor Yellow
    exit 0
}
else {
    Write-Success-Msg "CLAUDE.md validation passed"
    exit 0
}
