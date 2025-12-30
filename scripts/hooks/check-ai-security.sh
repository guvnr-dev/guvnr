#!/usr/bin/env bash
# AI Security Pattern Detection Hook
#
# Checks for common AI-generated security vulnerabilities:
# - eval() usage (code injection risk)
# - Hardcoded credentials
# - SQL injection patterns
# - Command injection patterns
#
# Part of the AI Excellence Framework
# https://github.com/ai-excellence-framework/ai-excellence-framework

set -euo pipefail

ISSUES=0

# Check for eval() usage
if grep -rn 'eval\s*(' --include="*.js" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v __pycache__; then
    echo "⚠️  Warning: eval() usage detected - potential code injection risk"
    ISSUES=$((ISSUES + 1))
fi

# Check for hardcoded credentials (basic patterns)
if grep -rniE "(password|secret|api_key|apikey|token)\s*=\s*['\"][^'\"]{8,}" --include="*.js" --include="*.ts" --include="*.py" --include="*.go" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v __pycache__ | grep -v "example" | grep -v "test" | grep -v ".md"; then
    echo "⚠️  Warning: Potential hardcoded credentials detected"
    ISSUES=$((ISSUES + 1))
fi

# Check for SQL string concatenation (SQL injection)
if grep -rniE "(SELECT|INSERT|UPDATE|DELETE).*\+.*\$|f['\"].*SELECT|format.*SELECT" --include="*.js" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v __pycache__ | grep -v test; then
    echo "⚠️  Warning: Potential SQL injection - string concatenation in SQL"
    ISSUES=$((ISSUES + 1))
fi

# Check for shell command string concatenation (command injection)
if grep -rniE "exec\s*\(.*\+|subprocess.*shell\s*=\s*True|os\.system\s*\(" --include="*.js" --include="*.ts" --include="*.py" . 2>/dev/null | grep -v node_modules | grep -v ".git" | grep -v __pycache__ | grep -v test; then
    echo "⚠️  Warning: Potential command injection detected"
    ISSUES=$((ISSUES + 1))
fi

if [ $ISSUES -gt 0 ]; then
    echo ""
    echo "Found $ISSUES potential AI-generated security issues."
    echo "Review these patterns before committing."
    echo "See: https://owasp.org/www-project-top-ten/"
    # Uncomment to block commits with issues:
    # exit 1
fi

exit 0
