<#
.SYNOPSIS
    AI Security Pattern Detection Hook for PowerShell

.DESCRIPTION
    Checks for common AI-generated security vulnerabilities:
    - eval() usage (code injection risk)
    - Hardcoded credentials
    - SQL injection patterns
    - Command injection patterns

.PARAMETER Enforce
    Block commits on security issues

.PARAMETER Strict
    Enable strict mode with additional patterns

.PARAMETER Json
    Output results in JSON format for CI/CD integration

.EXAMPLE
    .\Check-AISecurity.ps1
    .\Check-AISecurity.ps1 -Enforce -Strict
    .\Check-AISecurity.ps1 -Json | ConvertFrom-Json

.NOTES
    Part of the AI Excellence Framework
    https://github.com/ai-excellence-framework/ai-excellence-framework
#>

[CmdletBinding()]
param(
    [switch]$Enforce,
    [switch]$Strict,
    [switch]$Json
)

# Enable strict mode for better error handling
Set-StrictMode -Version Latest
$ErrorActionPreference = 'Stop'

# Read environment variables as fallback
if (-not $Enforce -and $env:AIX_SECURITY_ENFORCE -eq 'true') { $Enforce = $true }
if (-not $Strict -and $env:AIX_SECURITY_STRICT -eq 'true') { $Strict = $true }
if (-not $Json -and $env:AIX_STRUCTURED_LOGGING -eq 'true') { $Json = $true }

# Initialize counters
$script:Issues = 0
$script:Warnings = 0
$script:Findings = @()

function Add-Finding {
    param(
        [string]$Level,
        [string]$Message,
        [string]$Category = ''
    )

    $finding = @{
        timestamp = (Get-Date -Format 'yyyy-MM-ddTHH:mm:ssZ')
        level = $Level
        message = $Message
    }
    if ($Category) { $finding.category = $Category }

    $script:Findings += $finding

    if (-not $Json) {
        switch ($Level) {
            'error' { Write-Host "❌ $Message" -ForegroundColor Red }
            'warn'  { Write-Host "⚠️  $Message" -ForegroundColor Yellow }
            'info'  { Write-Host $Message }
        }
    }
}

function Search-Pattern {
    param(
        [string]$Pattern,
        [string[]]$FileTypes,
        [string[]]$ExcludeDirs = @('node_modules', '.git', '__pycache__', 'dist', 'build')
    )

    $results = @()
    $includePatterns = $FileTypes | ForEach-Object { "*.$_" }

    try {
        $files = Get-ChildItem -Path . -Include $includePatterns -Recurse -File -ErrorAction SilentlyContinue |
            Where-Object {
                $path = $_.FullName
                -not ($ExcludeDirs | Where-Object { $path -like "*\$_\*" })
            }

        foreach ($file in $files) {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction SilentlyContinue
            if ($content -match $Pattern) {
                $lineNum = 0
                foreach ($line in (Get-Content $file.FullName)) {
                    $lineNum++
                    if ($line -match $Pattern) {
                        # Sanitize and truncate output
                        $sanitizedLine = $line -replace '\x1b\[[0-9;]*[a-zA-Z]', '' |
                            Select-Object -First 1
                        if ($sanitizedLine.Length -gt 200) {
                            $sanitizedLine = $sanitizedLine.Substring(0, 200) + '...'
                        }
                        $results += "${file}:${lineNum}: $sanitizedLine"
                    }
                }
            }
        }
    }
    catch {
        Write-Verbose "Error searching pattern: $_"
    }

    return $results
}

# Main execution
if (-not $Json) {
    Write-Host "🔒 AI Security Check" -ForegroundColor Cyan
    Write-Host "   Enforcement: $Enforce | Strict mode: $Strict"
    Write-Host ""
}

# Check for eval() usage
$evalResults = Search-Pattern -Pattern 'eval\s*\(' -FileTypes @('js', 'ts', 'py')
if ($evalResults.Count -gt 0) {
    if (-not $Json) {
        $evalResults | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
    }
    Add-Finding -Level 'warn' -Message 'eval() usage detected - potential code injection risk' -Category 'eval_usage'
    $script:Issues++
}

# Check for hardcoded credentials
$credentialPattern = '(password|secret|api_key|apikey|token)\s*=\s*[''"][^''"]{8,}[''"]'
$credResults = Search-Pattern -Pattern $credentialPattern -FileTypes @('js', 'ts', 'py', 'go') |
    Where-Object { $_ -notmatch '(/tests/|/__tests__/|/test/|\.example|\.sample|\.md)' }

if ($credResults.Count -gt 0) {
    if (-not $Json) {
        $credResults | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
    }
    Add-Finding -Level 'warn' -Message 'Potential hardcoded credentials detected' -Category 'hardcoded_credentials'
    $script:Issues++
}

# Check for SQL injection patterns
$sqlPattern = '(SELECT|INSERT|UPDATE|DELETE).*\+.*\$|f[''"].*SELECT|format.*SELECT'
$sqlResults = Search-Pattern -Pattern $sqlPattern -FileTypes @('js', 'ts', 'py') |
    Where-Object { $_ -notmatch '(/tests/|/__tests__/|/test/)' }

if ($sqlResults.Count -gt 0) {
    if (-not $Json) {
        $sqlResults | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
    }
    Add-Finding -Level 'warn' -Message 'Potential SQL injection - string concatenation in SQL' -Category 'sql_injection'
    $script:Issues++
}

# Check for command injection
$cmdPattern = 'exec\s*\(.*\+|subprocess.*shell\s*=\s*True|os\.system\s*\('
$cmdResults = Search-Pattern -Pattern $cmdPattern -FileTypes @('js', 'ts', 'py') |
    Where-Object { $_ -notmatch '(/tests/|/__tests__/|/test/)' }

if ($cmdResults.Count -gt 0) {
    if (-not $Json) {
        $cmdResults | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
    }
    Add-Finding -Level 'warn' -Message 'Potential command injection detected' -Category 'command_injection'
    $script:Issues++
}

# Strict mode additional checks
if ($Strict) {
    if (-not $Json) {
        Write-Host ""
        Write-Host "🔍 Running strict mode checks..." -ForegroundColor Cyan
    }

    # innerHTML XSS check
    $innerHtmlResults = Search-Pattern -Pattern 'innerHTML\s*=' -FileTypes @('js', 'ts', 'jsx', 'tsx')
    if ($innerHtmlResults.Count -gt 0) {
        if (-not $Json) {
            $innerHtmlResults | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
        }
        Add-Finding -Level 'warn' -Message 'innerHTML assignment detected - potential XSS risk' -Category 'innerHTML_xss'
        $script:Warnings++
    }

    # dangerouslySetInnerHTML React check
    $dangerousResults = Search-Pattern -Pattern 'dangerouslySetInnerHTML' -FileTypes @('js', 'ts', 'jsx', 'tsx')
    if ($dangerousResults.Count -gt 0) {
        if (-not $Json) {
            $dangerousResults | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
        }
        Add-Finding -Level 'warn' -Message 'dangerouslySetInnerHTML detected - review for XSS safety' -Category 'dangerously_set_innerHTML'
        $script:Warnings++
    }

    # Python pickle deserialization check
    $pickleResults = Search-Pattern -Pattern 'pickle\.load' -FileTypes @('py')
    if ($pickleResults.Count -gt 0) {
        if (-not $Json) {
            $pickleResults | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
        }
        Add-Finding -Level 'warn' -Message 'pickle.load detected - deserialization vulnerability risk' -Category 'pickle_deserialization'
        $script:Warnings++
    }

    # Python yaml.load without safe_load
    $yamlResults = Search-Pattern -Pattern 'yaml\.load\s*\(' -FileTypes @('py') |
        Where-Object { $_ -notmatch 'safe_load' }
    if ($yamlResults.Count -gt 0) {
        if (-not $Json) {
            $yamlResults | Select-Object -First 20 | ForEach-Object { Write-Host $_ }
        }
        Add-Finding -Level 'warn' -Message 'yaml.load without Loader detected - use yaml.safe_load instead' -Category 'yaml_load_unsafe'
        $script:Warnings++
    }
}

# Output results
if ($Json) {
    $output = @{
        tool = 'check-ai-security'
        version = '1.0.0'
        issues = $script:Issues
        warnings = $script:Warnings
        enforce = $Enforce
        strict = $Strict
        findings = $script:Findings
    }
    $output | ConvertTo-Json -Depth 10

    if ($Enforce -and $script:Issues -gt 0) {
        exit 1
    }
}
else {
    Write-Host ""
    if ($script:Issues -gt 0 -or $script:Warnings -gt 0) {
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray
        Write-Host "Found $($script:Issues) critical issues and $($script:Warnings) warnings."
        Write-Host "Review these patterns before committing."
        Write-Host "See: https://owasp.org/www-project-top-ten/"
        Write-Host ""
        Write-Host "To configure enforcement:"
        Write-Host '  $env:AIX_SECURITY_ENFORCE = "true"  # Block commits on issues'
        Write-Host '  $env:AIX_SECURITY_STRICT = "true"   # Enable strict mode'
        Write-Host '  $env:AIX_STRUCTURED_LOGGING = "true" # Enable JSON output'
        Write-Host "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━" -ForegroundColor Gray

        if ($Enforce -and $script:Issues -gt 0) {
            Write-Host ""
            Write-Host "❌ Commit blocked due to security issues." -ForegroundColor Red
            Write-Host '   Fix the issues above or set $env:AIX_SECURITY_ENFORCE = "false" to skip.'
            exit 1
        }
    }
    else {
        Write-Host "✅ No security issues detected." -ForegroundColor Green
    }
}

exit 0
