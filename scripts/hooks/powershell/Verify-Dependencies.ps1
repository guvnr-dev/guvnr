<#
.SYNOPSIS
    AI Excellence Framework - Dependency Verification for PowerShell

.DESCRIPTION
    Verifies that dependencies exist before installation.
    Prevents slopsquatting attacks from hallucinated package names.

.PARAMETER Target
    The dependency file to check. Defaults to 'auto' which checks all known types.
    Supports: package.json, requirements.txt, or auto

.EXAMPLE
    .\Verify-Dependencies.ps1
    .\Verify-Dependencies.ps1 -Target package.json
    .\Verify-Dependencies.ps1 -Target requirements.txt

.NOTES
    Background:
      AI assistants sometimes hallucinate plausible package names.
      Attackers register these names (slopsquatting) to inject malware.
      This script verifies packages exist before they're installed.

    Part of the AI Excellence Framework
    https://github.com/ai-excellence-framework/ai-excellence-framework
#>

[CmdletBinding()]
param(
    [string]$Target = 'auto'
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Logging functions
function Write-Error-Log {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Warning-Log {
    param([string]$Message)
    Write-Host "[WARN] $Message" -ForegroundColor Yellow
}

function Write-Success-Log {
    param([string]$Message)
    Write-Host "[OK] $Message" -ForegroundColor Green
}

function Write-Info-Log {
    param([string]$Message)
    Write-Host "[INFO] $Message"
}

# Verify npm package exists
function Test-NpmPackage {
    param([string]$Package)

    # Check if package exists on npm
    try {
        $null = npm view $Package name 2>$null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Verify Python package exists on PyPI
function Test-PyPIPackage {
    param([string]$Package)

    try {
        # Try pip index versions (newer pip)
        $null = pip index versions $Package 2>$null
        if ($LASTEXITCODE -eq 0) { return $true }

        # Fallback: try pip show if installed
        $null = pip show $Package 2>$null
        return $LASTEXITCODE -eq 0
    }
    catch {
        return $false
    }
}

# Check npm packages from package.json
function Test-NpmPackages {
    param([string]$File = 'package.json')

    if (-not (Test-Path $File)) {
        Write-Info-Log "No $File found, skipping npm check"
        return $true
    }

    if (-not (Get-Command npm -ErrorAction SilentlyContinue)) {
        Write-Warning-Log "npm not found, skipping npm package verification"
        return $true
    }

    Write-Info-Log "Verifying npm packages in $File..."

    $issues = 0
    $packageJson = Get-Content $File -Raw | ConvertFrom-Json

    foreach ($depType in @('dependencies', 'devDependencies')) {
        $deps = $packageJson.$depType
        if ($deps) {
            $packages = $deps.PSObject.Properties.Name
            foreach ($package in $packages) {
                if (-not (Test-NpmPackage -Package $package)) {
                    Write-Error-Log "Package '$package' not found on npm registry!"
                    Write-Warning-Log "This could be a hallucinated package name (slopsquatting risk)"
                    $issues++
                }
            }
        }
    }

    if ($issues -eq 0) {
        Write-Success-Log "All npm packages verified"
        return $true
    }
    else {
        Write-Error-Log "Found $issues suspicious packages. Review before installing."
        return $false
    }
}

# Check Python packages from requirements.txt
function Test-PythonPackages {
    param([string]$File = 'requirements.txt')

    if (-not (Test-Path $File)) {
        Write-Info-Log "No $File found, skipping Python check"
        return $true
    }

    if (-not (Get-Command pip -ErrorAction SilentlyContinue)) {
        Write-Warning-Log "pip not found, skipping Python package verification"
        return $true
    }

    Write-Info-Log "Verifying Python packages in $File..."

    $issues = 0
    $lines = Get-Content $File

    foreach ($line in $lines) {
        # Skip empty lines, comments, and options
        if ([string]::IsNullOrWhiteSpace($line) -or $line.TrimStart().StartsWith('#') -or $line.TrimStart().StartsWith('-')) {
            continue
        }

        # Extract package name (before any version specifier)
        $package = ($line -split '[<>=!~\[\]]')[0].Trim()

        if ([string]::IsNullOrWhiteSpace($package)) { continue }

        if (-not (Test-PyPIPackage -Package $package)) {
            Write-Error-Log "Package '$package' not found on PyPI!"
            Write-Warning-Log "This could be a hallucinated package name (slopsquatting risk)"
            $issues++
        }
    }

    if ($issues -eq 0) {
        Write-Success-Log "All Python packages verified"
        return $true
    }
    else {
        Write-Error-Log "Found $issues suspicious packages. Review before installing."
        return $false
    }
}

# Main execution
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host "  AI Excellence Framework - Dependency Verification" -ForegroundColor Cyan
Write-Host "═══════════════════════════════════════════════════════════" -ForegroundColor Cyan
Write-Host ""

$exitCode = 0

switch -Regex ($Target) {
    '^auto$' {
        if (Test-Path 'package.json') {
            if (-not (Test-NpmPackages -File 'package.json')) { $exitCode = 1 }
        }
        if (Test-Path 'requirements.txt') {
            if (-not (Test-PythonPackages -File 'requirements.txt')) { $exitCode = 1 }
        }
        if (Test-Path 'Pipfile') {
            Write-Warning-Log "Pipfile detected - manual verification recommended"
        }
        if (Test-Path 'pyproject.toml') {
            Write-Warning-Log "pyproject.toml detected - manual verification recommended"
        }
    }
    '\.json$' {
        if (-not (Test-NpmPackages -File $Target)) { $exitCode = 1 }
    }
    '\.txt$' {
        if (-not (Test-PythonPackages -File $Target)) { $exitCode = 1 }
    }
    default {
        Write-Error-Log "Unknown file type: $Target"
        Write-Host "Usage: .\Verify-Dependencies.ps1 [-Target package.json|requirements.txt|auto]"
        exit 1
    }
}

Write-Host ""
if ($exitCode -eq 0) {
    Write-Success-Log "All dependency checks passed"
}
else {
    Write-Error-Log "Some dependency checks failed. Review above for details."
}

exit $exitCode
