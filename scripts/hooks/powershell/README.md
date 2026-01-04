# PowerShell Hooks for Windows

This directory contains PowerShell equivalents of all bash hooks for Windows users.

## Available Scripts

| Script                    | Purpose                         | Bash Equivalent        |
| ------------------------- | ------------------------------- | ---------------------- |
| `Check-AISecurity.ps1`    | Security vulnerability scanning | `check-ai-security.sh` |
| `Verify-Dependencies.ps1` | Slopsquatting prevention        | `verify-deps.sh`       |
| `Check-ClaudeMd.ps1`      | CLAUDE.md validation            | `check-claude-md.sh`   |
| `Check-Todos.ps1`         | Critical TODO detection         | `check-todos.sh`       |
| `Invoke-PostEdit.ps1`     | Auto-formatting post-edit       | `post-edit.sh`         |

## Requirements

- PowerShell 5.1+ (Windows) or PowerShell 7+ (cross-platform)
- Git (for hooks that check staged changes)
- Optional: Node.js/npm (for JavaScript/TypeScript formatting)
- Optional: Python/pip (for Python formatting)

## Installation

### Option 1: Manual Copy

Copy the desired scripts to your project and configure git hooks:

```powershell
# Copy hooks
Copy-Item .\*.ps1 -Destination .\.git\hooks\

# Create pre-commit hook
@"
#!/bin/sh
powershell.exe -ExecutionPolicy Bypass -File .git/hooks/Check-AISecurity.ps1
powershell.exe -ExecutionPolicy Bypass -File .git/hooks/Check-ClaudeMd.ps1
powershell.exe -ExecutionPolicy Bypass -File .git/hooks/Check-Todos.ps1
"@ | Set-Content .\.git\hooks\pre-commit
```

### Option 2: With Husky

Add to your `.husky/pre-commit`:

```sh
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

if command -v powershell.exe &> /dev/null; then
    powershell.exe -ExecutionPolicy Bypass -File scripts/hooks/powershell/Check-AISecurity.ps1
    powershell.exe -ExecutionPolicy Bypass -File scripts/hooks/powershell/Check-ClaudeMd.ps1
fi
```

### Option 3: With pre-commit Framework

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: local
    hooks:
      - id: ai-security-check
        name: AI Security Check
        entry: powershell.exe -ExecutionPolicy Bypass -File scripts/hooks/powershell/Check-AISecurity.ps1
        language: system
        pass_filenames: false
        stages: [commit]
```

## Usage

### Check-AISecurity.ps1

```powershell
# Basic scan
.\Check-AISecurity.ps1

# Block commits on security issues
.\Check-AISecurity.ps1 -Enforce

# Enable strict mode (additional patterns)
.\Check-AISecurity.ps1 -Strict

# JSON output for CI/CD
.\Check-AISecurity.ps1 -Json | ConvertFrom-Json

# Environment variable configuration
$env:GUVNR_SECURITY_ENFORCE = "true"
$env:GUVNR_SECURITY_STRICT = "true"
.\Check-AISecurity.ps1
```

### Verify-Dependencies.ps1

```powershell
# Auto-detect dependency files
.\Verify-Dependencies.ps1

# Check specific file
.\Verify-Dependencies.ps1 -Target package.json
.\Verify-Dependencies.ps1 -Target requirements.txt
```

### Check-ClaudeMd.ps1

```powershell
# Validate CLAUDE.md
.\Check-ClaudeMd.ps1
```

### Invoke-PostEdit.ps1

```powershell
# Format a specific file
.\Invoke-PostEdit.ps1 -FilePath .\src\index.ts

# Dry run
.\Invoke-PostEdit.ps1 -FilePath .\script.py -DryRun

# Quiet mode
.\Invoke-PostEdit.ps1 -FilePath .\app.js -Quiet
```

## Configuration

### Environment Variables

| Variable                  | Description             | Default |
| ------------------------- | ----------------------- | ------- |
| `GUVNR_SECURITY_ENFORCE`  | Block commits on issues | `false` |
| `GUVNR_SECURITY_STRICT`   | Enable strict mode      | `false` |
| `GUVNR_STRUCTURED_LOGGING`| JSON output             | `false` |
| `GUVNR_QUIET`             | Suppress output         | `0`     |
| `GUVNR_DRY_RUN`           | Dry run mode            | `0`     |
| `GUVNR_DEBUG`             | Debug logging           | `0`     |

## Detected Patterns

### Security Checks (Check-AISecurity.ps1)

**Critical Issues:**

- `eval()` usage (code injection)
- Hardcoded credentials
- SQL string concatenation
- Command injection patterns

**Strict Mode Additions:**

- `innerHTML` assignments (XSS)
- `dangerouslySetInnerHTML` (React XSS)
- `pickle.load` (Python deserialization)
- `yaml.load` without safe_load

### CLAUDE.md Validation (Check-ClaudeMd.ps1)

**Required Sections:**

- `## Overview`
- `## Tech Stack`
- `## Current State`

**Recommended Sections:**

- `## Architecture`
- `## Conventions`
- `## Common Commands`
- `## Session Instructions`

**Secret Detection Patterns:**

- API keys and tokens
- AWS access keys
- GitHub/GitLab tokens
- Private keys

## Troubleshooting

### Execution Policy Issues

If scripts won't run, check your execution policy:

```powershell
Get-ExecutionPolicy
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

### Missing npm/pip

Install formatters as needed:

```powershell
# JavaScript/TypeScript
npm install -g prettier eslint

# Python
pip install black ruff isort
```

### Performance

For large repositories, consider excluding directories:

```powershell
# Modify ExcludeDirs in the script
$ExcludeDirs = @('node_modules', '.git', '__pycache__', 'dist', 'build', 'vendor')
```

## Contributing

When modifying hooks, please update both bash and PowerShell versions to maintain parity.

## License

Part of Guvnr. See LICENSE for details.
