---
name: security-review
description: Perform security-focused code review using OWASP guidelines and AI-specific security best practices.
allowed-tools: Read, Grep, Glob
---

# Security Review Skill

This skill performs comprehensive security analysis of code, with special attention to AI-generated code vulnerabilities.

## When to Use

Activate this skill when:

- Reviewing AI-generated code
- Auditing authentication/authorization code
- Checking for OWASP Top 10 vulnerabilities
- Validating dependency security
- Before merging security-sensitive PRs

## OWASP Top 10 Checks

### 1. Injection Prevention

- **SQL Injection**: Use parameterized queries, never concatenate user input
- **Command Injection**: Avoid shell execution with user input, use safe APIs
- **XSS**: Sanitize all HTML output, use content security policies

### 2. Broken Authentication

- No hardcoded credentials or API keys
- Secure password hashing (bcrypt, argon2)
- Proper session management with secure cookies
- Multi-factor authentication for sensitive operations

### 3. Sensitive Data Exposure

- Encrypt data at rest and in transit
- Never log passwords, tokens, or PII
- Use environment variables for secrets
- Implement proper key management

### 4. XML External Entities (XXE)

- Disable external entity processing
- Use less complex data formats (JSON)
- Validate and sanitize XML input

### 5. Broken Access Control

- Implement principle of least privilege
- Validate authorization on every request
- Use secure direct object references
- Deny by default

## AI-Specific Security

### Slopsquatting Prevention

Before adding any dependency:

1. **Verify existence** on the package registry (npm, PyPI, etc.)
2. **Check download counts** - legitimate packages have thousands of downloads
3. **Check maintenance status** - last update, open issues
4. **Review for vulnerabilities** - `npm audit`, `pip-audit`
5. **Cross-reference with official documentation**

### AI Code Review Checklist

- [ ] No hardcoded secrets or API keys
- [ ] Input validation present on all user inputs
- [ ] Error messages don't expose internal details
- [ ] Dependencies are verified (not hallucinated)
- [ ] Authentication/authorization properly checked
- [ ] No eval() or dynamic code execution with user input
- [ ] SQL queries use parameterized statements
- [ ] File operations validate paths
- [ ] Rate limiting on public endpoints
- [ ] Logging doesn't include sensitive data

### Common AI Code Vulnerabilities

| Vulnerability            | AI Pattern                     | Mitigation                 |
| ------------------------ | ------------------------------ | -------------------------- |
| Hallucinated packages    | Non-existent npm/pip packages  | Verify on registry         |
| Insecure defaults        | `verify=False`, `secure=False` | Enable security by default |
| Missing input validation | Direct user input usage        | Add validation layer       |
| Verbose error messages   | Stack traces to users          | Generic error responses    |
| Hardcoded credentials    | API keys in code               | Use environment variables  |

## Security Commands

```bash
npm audit              # Check for known vulnerabilities
npm audit fix          # Auto-fix vulnerabilities
npx snyk test          # Deep vulnerability scan
npm outdated           # Check for outdated packages
```

## Reporting Format

When reporting security issues:

```markdown
## Security Finding

**Severity**: Critical/High/Medium/Low
**Category**: [OWASP category]
**Location**: [file:line]
**Description**: [What the vulnerability is]
**Impact**: [What could happen if exploited]
**Recommendation**: [How to fix it]
**References**: [OWASP/CWE links]
```
