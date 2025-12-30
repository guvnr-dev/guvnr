# Static Application Security Testing (SAST) Integration

This guide covers integrating SAST tools with the AI Excellence Framework to catch security vulnerabilities in AI-generated code before they reach production.

## Why SAST for AI-Generated Code?

Research shows AI-generated code has significant security vulnerabilities:

- **45% of AI code samples** contain security vulnerabilities ([Veracode 2025](https://www.veracode.com/blog/genai-code-security-report/))
- **86% failure rate** for Cross-Site Scripting (XSS) defenses
- **88% failure rate** for Log Injection protections
- **~20% of AI code** references non-existent packages ([Slopsquatting research](https://www.bleepingcomputer.com/news/security/ai-hallucinated-code-dependencies-become-new-supply-chain-risk/))

SAST tools provide automated detection of these vulnerabilities in your CI/CD pipeline.

---

## Tool Comparison

| Tool                | Languages   | Speed     | GitHub Integration | Best For                          |
| ------------------- | ----------- | --------- | ------------------ | --------------------------------- |
| **Semgrep**         | 40+         | Fast      | Native             | Custom rules, low false positives |
| **CodeQL**          | 10          | Slower    | Native (GHAS)      | Deep analysis, GitHub-native      |
| **Bandit**          | Python only | Very fast | Via SARIF          | Python-specific                   |
| **ESLint Security** | JS/TS only  | Fast      | Via SARIF          | JavaScript-specific               |

---

## Semgrep Integration

### Quick Start

```bash
# Install Semgrep
pip install semgrep

# Run with default rules
semgrep scan --config auto

# Run with OWASP rules (recommended for AI code)
semgrep scan --config p/owasp-top-ten
```

### GitHub Actions Workflow

Create `.github/workflows/semgrep.yml`:

```yaml
name: Semgrep SAST

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]
  schedule:
    # Run weekly on Sundays
    - cron: "0 0 * * 0"

jobs:
  semgrep:
    name: Semgrep Scan
    runs-on: ubuntu-latest
    permissions:
      contents: read
      security-events: write # Required for SARIF upload

    container:
      image: semgrep/semgrep

    steps:
      - name: Checkout code
        uses: actions/checkout@v4

      - name: Run Semgrep
        run: semgrep scan --sarif --output=semgrep.sarif --config auto --config p/owasp-top-ten --config p/security-audit
        env:
          SEMGREP_APP_TOKEN: ${{ secrets.SEMGREP_APP_TOKEN }}

      - name: Upload SARIF to GitHub
        uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif
        if: always()

      - name: Upload results artifact
        uses: actions/upload-artifact@v4
        with:
          name: semgrep-results
          path: semgrep.sarif
        if: always()
```

### Custom Rules for AI-Generated Code

Create `.semgrep/ai-code-rules.yaml`:

```yaml
rules:
  # Detect potentially hallucinated imports
  - id: suspicious-import-pattern
    pattern-either:
      - pattern: import $PACKAGE from "$SUSPICIOUS"
      - pattern: const $VAR = require("$SUSPICIOUS")
    pattern-regex: "$SUSPICIOUS"
    message: "Verify this package exists: $SUSPICIOUS. AI models may hallucinate package names."
    languages: [javascript, typescript]
    severity: WARNING
    metadata:
      category: supply-chain
      technology:
        - ai-generated-code
      references:
        - https://www.bleepingcomputer.com/news/security/ai-hallucinated-code-dependencies-become-new-supply-chain-risk/

  # Detect hardcoded secrets (common in AI code)
  - id: ai-hardcoded-secret
    patterns:
      - pattern-either:
          - pattern: |
              $KEY = "..."
          - pattern: |
              "$KEY": "..."
    metavariable-regex:
      metavariable: $KEY
      regex: (?i)(api_key|apikey|secret|password|token|auth|credential)
    message: "Potential hardcoded secret. AI often generates placeholder credentials."
    languages: [javascript, typescript, python]
    severity: ERROR
    metadata:
      category: security
      cwe: "CWE-798: Use of Hard-coded Credentials"
      owasp: "A07:2021 - Identification and Authentication Failures"

  # Detect unsafe SQL construction (common AI pattern)
  - id: ai-sql-injection
    patterns:
      - pattern-either:
          - pattern: |
              $QUERY = f"SELECT ... {$USER_INPUT} ..."
          - pattern: |
              $QUERY = "SELECT ..." + $USER_INPUT
          - pattern: |
              `SELECT ... ${$USER_INPUT} ...`
    message: "Potential SQL injection. Use parameterized queries instead."
    languages: [python, javascript, typescript]
    severity: ERROR
    metadata:
      category: security
      cwe: "CWE-89: SQL Injection"
      owasp: "A03:2021 - Injection"

  # Detect unsafe command execution
  - id: ai-command-injection
    patterns:
      - pattern-either:
          - pattern: os.system($CMD)
          - pattern: subprocess.call($CMD, shell=True)
          - pattern: exec($CMD)
          - pattern: child_process.exec($CMD)
    message: "Potential command injection. Avoid shell=True and use argument lists."
    languages: [python, javascript]
    severity: ERROR
    metadata:
      category: security
      cwe: "CWE-78: OS Command Injection"

  # Detect missing input validation (very common in AI code)
  - id: ai-missing-validation
    patterns:
      - pattern: |
          def $FUNC($PARAM):
              ...
              $DB.execute(..., $PARAM, ...)
      - pattern-not: |
          def $FUNC($PARAM):
              ...
              validate($PARAM)
              ...
              $DB.execute(..., $PARAM, ...)
    message: "Database operation without input validation. Validate $PARAM before use."
    languages: [python]
    severity: WARNING
    metadata:
      category: security
      cwe: "CWE-20: Improper Input Validation"

  # Detect AI's tendency to disable security features
  - id: ai-disabled-security
    pattern-either:
      - pattern: verify=False
      - pattern: secure=False
      - pattern: ssl=False
      - pattern: 'NODE_TLS_REJECT_UNAUTHORIZED': '0'
      - pattern: process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
    message: "Security feature disabled. AI often disables security for 'simplicity'."
    languages: [python, javascript, typescript]
    severity: ERROR
    metadata:
      category: security
      cwe: "CWE-295: Improper Certificate Validation"
```

### Pre-commit Hook

Add to `.pre-commit-config.yaml`:

```yaml
repos:
  - repo: https://github.com/semgrep/semgrep
    rev: v1.90.0
    hooks:
      - id: semgrep
        name: Semgrep Security Scan
        args:
          - --config=auto
          - --config=p/owasp-top-ten
          - --config=.semgrep/
          - --error
        stages: [commit]
```

---

## CodeQL Integration

### GitHub Actions Workflow

Create `.github/workflows/codeql.yml`:

```yaml
name: CodeQL Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 3 * * 1" # Weekly on Monday

jobs:
  analyze:
    name: Analyze
    runs-on: ubuntu-latest
    permissions:
      actions: read
      contents: read
      security-events: write

    strategy:
      fail-fast: false
      matrix:
        language: [javascript, python]
        # Add other languages as needed: java, csharp, cpp, go, ruby, swift

    steps:
      - name: Checkout repository
        uses: actions/checkout@v4

      - name: Initialize CodeQL
        uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          # Use extended security queries for AI-generated code
          queries: +security-extended,security-and-quality
          config-file: .github/codeql/codeql-config.yml

      # For compiled languages, add build steps here
      - name: Autobuild
        uses: github/codeql-action/autobuild@v3

      - name: Perform CodeQL Analysis
        uses: github/codeql-action/analyze@v3
        with:
          category: "/language:${{ matrix.language }}"
```

### CodeQL Configuration

Create `.github/codeql/codeql-config.yml`:

```yaml
name: "AI Excellence Security Config"

# Use extended queries for comprehensive analysis
queries:
  - uses: security-extended
  - uses: security-and-quality

# Query filters for AI-generated code concerns
query-filters:
  - include:
      tags contain: security
  - include:
      tags contain: correctness
  - include:
      tags contain: maintainability
  - include:
      problem.severity:
        - error
        - warning

# Path filters
paths:
  - src
  - scripts
  - bin

paths-ignore:
  - node_modules
  - "**/*.test.js"
  - "**/*.spec.js"
  - tests
  - docs
  - .tmp
```

### Custom CodeQL Queries

Create `.github/codeql/custom-queries/ai-security.ql`:

```ql
/**
 * @name Potential AI-hallucinated dependency
 * @description Detects imports that may be hallucinated by AI models
 * @kind problem
 * @problem.severity warning
 * @precision medium
 * @id js/ai-hallucinated-import
 * @tags security
 *       external/cwe/cwe-829
 *       ai-generated-code
 */

import javascript

from ImportDeclaration imp, string moduleName
where
  moduleName = imp.getImportedPath().getValue() and
  // Flag unusual package naming patterns common in AI hallucinations
  (
    moduleName.regexpMatch(".*-helper$") or
    moduleName.regexpMatch(".*-utils$") or
    moduleName.regexpMatch(".*-lib$")
  ) and
  not moduleName.matches("@%") // Exclude scoped packages
select imp, "Verify this import exists in package.json: " + moduleName
```

---

## Bandit (Python-Specific)

### Installation and Usage

```bash
# Install
pip install bandit

# Run scan
bandit -r scripts/mcp/ -f json -o bandit-results.json

# Run with all plugins
bandit -r . -a file -f json -o bandit-results.json
```

### GitHub Actions Integration

Add to your CI workflow:

```yaml
bandit-scan:
  name: Bandit Security Scan
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4

    - name: Set up Python
      uses: actions/setup-python@v5
      with:
        python-version: "3.12"

    - name: Install Bandit
      run: pip install bandit[toml]

    - name: Run Bandit
      run: bandit -r scripts/mcp/ -f sarif -o bandit.sarif --severity-level medium

    - name: Upload SARIF
      uses: github/codeql-action/upload-sarif@v3
      with:
        sarif_file: bandit.sarif
      if: always()
```

### Bandit Configuration

Create `pyproject.toml` or `.bandit`:

```toml
[tool.bandit]
exclude_dirs = ["tests", ".tmp", "venv"]
skips = ["B101"]  # Skip assert warnings in tests

[tool.bandit.assert_used]
skips = ["*_test.py", "*test*.py"]
```

---

## ESLint Security (JavaScript/TypeScript)

### Installation

```bash
npm install --save-dev eslint-plugin-security eslint-plugin-no-unsanitized
```

### ESLint Configuration

Update `eslint.config.js`:

```javascript
import security from "eslint-plugin-security";
import noUnsanitized from "eslint-plugin-no-unsanitized";

export default [
  // ... other configs
  {
    plugins: {
      security,
      "no-unsanitized": noUnsanitized,
    },
    rules: {
      // Security rules for AI-generated code
      "security/detect-object-injection": "warn",
      "security/detect-non-literal-regexp": "warn",
      "security/detect-unsafe-regex": "error",
      "security/detect-buffer-noassert": "error",
      "security/detect-child-process": "warn",
      "security/detect-disable-mustache-escape": "error",
      "security/detect-eval-with-expression": "error",
      "security/detect-no-csrf-before-method-override": "error",
      "security/detect-non-literal-fs-filename": "warn",
      "security/detect-non-literal-require": "warn",
      "security/detect-possible-timing-attacks": "warn",
      "security/detect-pseudoRandomBytes": "error",

      // No unsanitized rules
      "no-unsanitized/method": "error",
      "no-unsanitized/property": "error",
    },
  },
];
```

---

## Unified CI Pipeline

### Complete Security Workflow

Create `.github/workflows/security.yml`:

```yaml
name: Security Analysis

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]
  schedule:
    - cron: "0 6 * * 1"

jobs:
  dependency-review:
    name: Dependency Review
    runs-on: ubuntu-latest
    if: github.event_name == 'pull_request'
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
          deny-licenses: GPL-3.0, AGPL-3.0

  semgrep:
    name: Semgrep SAST
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    container:
      image: semgrep/semgrep
    steps:
      - uses: actions/checkout@v4
      - run: semgrep scan --sarif --output=semgrep.sarif --config auto --config p/owasp-top-ten
      - uses: github/codeql-action/upload-sarif@v3
        with:
          sarif_file: semgrep.sarif
        if: always()

  codeql:
    name: CodeQL Analysis
    runs-on: ubuntu-latest
    permissions:
      security-events: write
    strategy:
      matrix:
        language: [javascript, python]
    steps:
      - uses: actions/checkout@v4
      - uses: github/codeql-action/init@v3
        with:
          languages: ${{ matrix.language }}
          queries: +security-extended
      - uses: github/codeql-action/autobuild@v3
      - uses: github/codeql-action/analyze@v3

  npm-audit:
    name: NPM Audit
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - run: npm ci
      - run: npm audit --audit-level=high

  secrets-scan:
    name: Secrets Detection
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - uses: gitleaks/gitleaks-action@v2
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}

  slopsquatting-check:
    name: Package Verification
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - name: Verify packages exist
        run: |
          echo "Checking for potentially hallucinated packages..."
          npm ls --json 2>/dev/null | jq -r '.dependencies | keys[]' | while read pkg; do
            if ! npm view "$pkg" name 2>/dev/null; then
              echo "WARNING: Package '$pkg' not found in registry"
              exit 1
            fi
          done
          echo "All packages verified"
```

---

## Security Dashboard

### Viewing Results

After implementing these workflows:

1. **GitHub Security Tab**: Navigate to `Repository → Security → Code scanning alerts`
2. **Dependabot Alerts**: `Repository → Security → Dependabot alerts`
3. **Secret Scanning**: `Repository → Security → Secret scanning alerts`

### Metrics to Track

| Metric                   | Target | Action if Exceeded |
| ------------------------ | ------ | ------------------ |
| Critical vulnerabilities | 0      | Block merge        |
| High vulnerabilities     | 0      | Block merge        |
| Medium vulnerabilities   | <5     | Review required    |
| Low vulnerabilities      | <20    | Track trend        |
| False positive rate      | <10%   | Tune rules         |

---

## Best Practices for AI-Generated Code Review

1. **Trust but verify**: AI code often looks correct but contains subtle vulnerabilities
2. **Check dependencies**: Verify every `import` or `require` against official registries
3. **Validate inputs**: AI often skips input validation—add explicit checks
4. **Review error handling**: AI tends to expose internal details in error messages
5. **Check for hardcoded secrets**: AI frequently generates placeholder credentials
6. **Run SAST on every PR**: Automated checks catch what humans miss

---

## Sources

- [Semgrep Documentation](https://semgrep.dev/docs/)
- [GitHub CodeQL Documentation](https://docs.github.com/en/code-security/code-scanning/introduction-to-code-scanning/about-code-scanning-with-codeql)
- [GitHub Actions Workflow Security with CodeQL](https://github.blog/changelog/2025-04-22-github-actions-workflow-security-analysis-with-codeql-is-now-generally-available/)
- [Semgrep vs GitHub Advanced Security](https://semgrep.dev/resources/semgrep-vs-github/)
- [Veracode GenAI Code Security Report](https://www.veracode.com/blog/genai-code-security-report/)
- [OWASP Top 10 for Agentic Applications](https://genai.owasp.org/2025/12/09/owasp-top-10-for-agentic-applications-the-benchmark-for-agentic-security-in-the-age-of-autonomous-ai/)
