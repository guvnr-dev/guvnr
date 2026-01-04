<#
.SYNOPSIS
    Check for TODO/FIXME comments that might indicate incomplete work

.DESCRIPTION
    Scans staged changes for high-priority markers (TODO, FIXME, HACK, XXX)
    with critical flags (!CRITICAL, !URGENT, !BLOCKING). Blocks commits
    when critical TODOs are found.

.EXAMPLE
    .\Check-Todos.ps1

.NOTES
    Part of the AI Excellence Framework
    https://github.com/ai-excellence-framework/ai-excellence-framework
#>

[CmdletBinding()]
param()

Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Look for high-priority markers in staged files
try {
    $diff = git diff --cached 2>$null
    $criticalPattern = '^\+.*\b(TODO|FIXME|HACK|XXX)\b.*(!|CRITICAL|URGENT|BLOCKING)'
    $criticalTodos = $diff | Where-Object { $_ -match $criticalPattern }

    if ($criticalTodos) {
        Write-Host "🔴 Critical TODOs found in staged changes:" -ForegroundColor Red
        $criticalTodos | ForEach-Object { Write-Host $_ }
        Write-Host ""
        Write-Host "These should be resolved before committing."
        Write-Host "To override: git commit --no-verify"
        exit 1
    }

    # Count regular TODOs (warning only)
    $todoPattern = '^\+.*\b(TODO|FIXME)\b'
    $todoCount = ($diff | Where-Object { $_ -match $todoPattern }).Count

    if ($todoCount -gt 3) {
        Write-Host "⚠️  Warning: $todoCount new TODO/FIXME comments in this commit" -ForegroundColor Yellow
        Write-Host "   Consider addressing these before committing"
    }
}
catch {
    # Not in a git repository or no staged changes
    Write-Verbose "Could not check staged changes: $_"
}

exit 0
