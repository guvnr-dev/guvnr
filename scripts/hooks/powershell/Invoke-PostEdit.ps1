<#
.SYNOPSIS
    AI Excellence Framework - Post-Edit Hook for PowerShell

.DESCRIPTION
    Auto-lint and format files after Claude Code edits them.
    Runs appropriate formatters based on file extension.

.PARAMETER FilePath
    The path to the file to format

.PARAMETER Quiet
    Suppress output

.PARAMETER DryRun
    Show what would be done without doing it

.EXAMPLE
    .\Invoke-PostEdit.ps1 -FilePath .\src\index.ts
    .\Invoke-PostEdit.ps1 -FilePath .\script.py -DryRun

.NOTES
    Part of the AI Excellence Framework
    https://github.com/ai-excellence-framework/ai-excellence-framework
#>

[CmdletBinding()]
param(
    [Parameter(Mandatory = $false, Position = 0)]
    [string]$FilePath,

    [switch]$Quiet,
    [switch]$DryRun
)

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Configuration from environment
if (-not $Quiet -and $env:AI_EXCELLENCE_QUIET -eq '1') { $Quiet = $true }
if (-not $DryRun -and $env:AI_EXCELLENCE_DRY_RUN -eq '1') { $DryRun = $true }
$TimeoutSeconds = 30

# Logging functions
function Write-Log {
    param([string]$Message)
    if (-not $Quiet) { Write-Host $Message }
}

function Write-LogError {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-LogDebug {
    param([string]$Message)
    if ($env:AI_EXCELLENCE_DEBUG -eq '1') {
        Write-Host "[DEBUG] $Message" -ForegroundColor DarkGray
    }
}

# Run a formatter with timeout and error handling
function Invoke-Formatter {
    param(
        [string]$Command,
        [string]$DisplayName,
        [string[]]$Arguments
    )

    if ($DryRun) {
        Write-Log "[DRY RUN] Would run: $Command $($Arguments -join ' ')"
        return
    }

    $cmdPath = Get-Command $Command -ErrorAction SilentlyContinue
    if ($cmdPath) {
        Write-LogDebug "Running $DisplayName..."
        try {
            $job = Start-Job -ScriptBlock {
                param($cmd, $args)
                & $cmd @args 2>&1
            } -ArgumentList $Command, $Arguments

            $completed = Wait-Job $job -Timeout $TimeoutSeconds
            if ($completed) {
                $null = Receive-Job $job
                Write-LogDebug "$DisplayName succeeded"
            }
            else {
                Stop-Job $job
                Write-LogError "$DisplayName timed out after ${TimeoutSeconds}s"
            }
            Remove-Job $job -Force
        }
        catch {
            Write-LogDebug "$DisplayName failed (continuing): $_"
        }
    }
    else {
        Write-LogDebug "$Command not found, skipping $DisplayName"
    }
}

# Run npx-based formatter
function Invoke-NpxFormatter {
    param(
        [string]$Package,
        [string]$DisplayName,
        [string[]]$Arguments
    )

    if ($DryRun) {
        Write-Log "[DRY RUN] Would run: npx $Package $($Arguments -join ' ')"
        return
    }

    $npx = Get-Command npx -ErrorAction SilentlyContinue
    if ($npx) {
        Write-LogDebug "Running $DisplayName via npx..."
        try {
            $job = Start-Job -ScriptBlock {
                param($pkg, $args)
                npx $pkg @args 2>&1
            } -ArgumentList $Package, $Arguments

            $completed = Wait-Job $job -Timeout $TimeoutSeconds
            if ($completed) {
                $null = Receive-Job $job
                Write-LogDebug "$DisplayName succeeded"
            }
            else {
                Stop-Job $job
            }
            Remove-Job $job -Force
        }
        catch {
            Write-LogDebug "$DisplayName failed or not installed (continuing)"
        }
    }
    else {
        Write-LogDebug "npx not found, skipping $DisplayName"
    }
}

# Main execution
if ([string]::IsNullOrWhiteSpace($FilePath)) {
    Write-LogDebug "No file path provided, exiting"
    exit 0
}

if (-not (Test-Path $FilePath)) {
    Write-LogError "File not found: $FilePath"
    exit 0  # Don't fail the hook, file might have been deleted
}

# Resolve to absolute path
$FilePath = (Resolve-Path $FilePath).Path

# Get file extension (lowercase)
$ext = [System.IO.Path]::GetExtension($FilePath).TrimStart('.').ToLower()

Write-LogDebug "Processing file: $FilePath (extension: $ext)"

# Format based on extension
switch ($ext) {
    { $_ -in 'ts', 'tsx' } {
        Invoke-NpxFormatter -Package 'eslint' -DisplayName 'ESLint' -Arguments @('--fix', $FilePath)
        Invoke-NpxFormatter -Package 'prettier' -DisplayName 'Prettier' -Arguments @('--write', $FilePath)
    }
    { $_ -in 'js', 'jsx', 'mjs', 'cjs' } {
        Invoke-NpxFormatter -Package 'eslint' -DisplayName 'ESLint' -Arguments @('--fix', $FilePath)
        Invoke-NpxFormatter -Package 'prettier' -DisplayName 'Prettier' -Arguments @('--write', $FilePath)
    }
    'py' {
        Invoke-Formatter -Command 'black' -DisplayName 'Black' -Arguments @($FilePath)
        Invoke-Formatter -Command 'ruff' -DisplayName 'Ruff' -Arguments @('check', '--fix', $FilePath)
        Invoke-Formatter -Command 'isort' -DisplayName 'isort' -Arguments @($FilePath)
    }
    'go' {
        Invoke-Formatter -Command 'gofmt' -DisplayName 'gofmt' -Arguments @('-w', $FilePath)
        Invoke-Formatter -Command 'goimports' -DisplayName 'goimports' -Arguments @('-w', $FilePath)
    }
    'rs' {
        Invoke-Formatter -Command 'rustfmt' -DisplayName 'rustfmt' -Arguments @($FilePath)
    }
    { $_ -in 'md', 'mdx' } {
        Invoke-NpxFormatter -Package 'prettier' -DisplayName 'Prettier' -Arguments @('--write', $FilePath)
    }
    'json' {
        Invoke-NpxFormatter -Package 'prettier' -DisplayName 'Prettier' -Arguments @('--write', $FilePath)
    }
    { $_ -in 'yaml', 'yml' } {
        Invoke-NpxFormatter -Package 'prettier' -DisplayName 'Prettier' -Arguments @('--write', $FilePath)
    }
    { $_ -in 'css', 'scss', 'less' } {
        Invoke-NpxFormatter -Package 'prettier' -DisplayName 'Prettier' -Arguments @('--write', $FilePath)
    }
    { $_ -in 'html', 'htm' } {
        Invoke-NpxFormatter -Package 'prettier' -DisplayName 'Prettier' -Arguments @('--write', $FilePath)
    }
    'rb' {
        Invoke-Formatter -Command 'rubocop' -DisplayName 'RuboCop' -Arguments @('-a', $FilePath)
    }
    'java' {
        Invoke-Formatter -Command 'google-java-format' -DisplayName 'google-java-format' -Arguments @('-i', $FilePath)
    }
    { $_ -in 'ps1', 'psm1', 'psd1' } {
        # PowerShell formatting with PSScriptAnalyzer if available
        $pssa = Get-Module -ListAvailable PSScriptAnalyzer -ErrorAction SilentlyContinue
        if ($pssa) {
            Write-LogDebug "Running PSScriptAnalyzer..."
            try {
                Invoke-ScriptAnalyzer -Path $FilePath -Fix -EnableExit:$false
                Write-LogDebug "PSScriptAnalyzer succeeded"
            }
            catch {
                Write-LogDebug "PSScriptAnalyzer failed (continuing)"
            }
        }
    }
    default {
        Write-LogDebug "No formatter configured for extension: $ext"
    }
}

Write-Log "✓ Formatted: $(Split-Path $FilePath -Leaf)"
