# MCP Server Security Guide

This document covers security considerations, hardening recommendations, and best practices for deploying the Project Memory MCP Server.

## Overview

The Model Context Protocol (MCP) server provides persistent memory for AI-assisted development sessions. While powerful, it requires careful security configuration to prevent abuse and protect sensitive data.

**Security Research Context**: In June 2025, [Backslash Security identified vulnerabilities](https://www.anthropic.com/news/model-context-protocol) in 2,000+ MCP servers, including over-permissioning patterns. This guide addresses those concerns.

---

## Threat Model

### Potential Attack Vectors

| Vector | Risk | Mitigation |
|--------|------|------------|
| **Prompt Injection** | AI manipulation to exfiltrate data | Input sanitization, output filtering |
| **Data Exfiltration** | Sensitive project info leaked | Access controls, encryption |
| **Denial of Service** | Resource exhaustion | Rate limiting, size limits |
| **SQL Injection** | Database compromise | Parameterized queries (implemented) |
| **Path Traversal** | Unauthorized file access | Path validation (implemented) |
| **Privilege Escalation** | Unauthorized operations | Confirmation for destructive ops |

### Data Sensitivity Levels

| Data Type | Sensitivity | Protection |
|-----------|-------------|------------|
| Decisions | Medium | Stored plaintext, sanitized input |
| Patterns | Low-Medium | Code examples may contain secrets |
| Context | Variable | Key-value pairs, user-controlled |
| Exports | High | Contains all data, encrypt at rest |

---

## Built-in Security Features

### 1. Input Sanitization

All inputs are sanitized before storage:

```python
def sanitize_input(value: str, max_length: int = 10000) -> str:
    """Sanitize string input to prevent injection and limit size."""
    if not isinstance(value, str):
        value = str(value)
    # Truncate if too long
    if len(value) > max_length:
        value = value[:max_length] + "... [truncated]"
    # Remove null bytes and other problematic characters
    value = value.replace('\x00', '')
    return value.strip()
```

### 2. Key Validation

Pattern and context keys are validated against a strict allowlist:

```python
def validate_key(key: str) -> bool:
    """Validate that a key is safe for use."""
    if not key or not isinstance(key, str):
        return False
    # Allow alphanumeric, underscores, hyphens, dots
    return bool(re.match(r'^[\w\-\.]+$', key)) and len(key) <= 100
```

### 3. Rate Limiting

Prevents abuse through excessive requests:

```python
# Configuration via environment
PROJECT_MEMORY_RATE_LIMIT=100  # Max 100 operations per minute

# Built-in rate limiter
rate_limiter = RateLimiter(max_ops=RATE_LIMIT, window_seconds=60)
```

### 4. Size Limits

Configurable limits prevent resource exhaustion:

| Resource | Default Limit | Environment Variable |
|----------|--------------|---------------------|
| Decisions | 1000 | `PROJECT_MEMORY_MAX_DECISIONS` |
| Patterns | 100 | `PROJECT_MEMORY_MAX_PATTERNS` |
| Context Keys | 50 | `PROJECT_MEMORY_MAX_CONTEXT_KEYS` |
| String Length | 10000 chars | (hardcoded) |

### 5. Destructive Operation Confirmation

The `purge_memory` operation requires explicit confirmation:

```
⚠️ To purge all memory, you must pass confirm='CONFIRM_PURGE'
This will permanently delete ALL decisions, patterns, and context!
```

---

## Hardening Recommendations

### 1. Database Security

#### Enable Encryption at Rest

For sensitive projects, use SQLCipher:

```bash
# Install SQLCipher
pip install sqlcipher3

# Set encryption key via environment
export PROJECT_MEMORY_ENCRYPTION_KEY="your-secure-key"
```

#### Restrict File Permissions

```bash
# Ensure database is only readable by owner
chmod 600 ~/.claude/project-memories/*.db

# Restrict directory access
chmod 700 ~/.claude/project-memories/
```

### 2. Network Security (Team Deployments)

If exposing MCP over network for team use:

```bash
# Only allow localhost connections
export PROJECT_MEMORY_BIND_HOST=127.0.0.1

# Use TLS for remote access (if exposed)
export PROJECT_MEMORY_TLS_CERT=/path/to/cert.pem
export PROJECT_MEMORY_TLS_KEY=/path/to/key.pem
```

### 3. Access Control

#### API Key Authentication (Optional)

```bash
# Enable API key requirement
export PROJECT_MEMORY_API_KEY="your-api-key"
```

#### Read-Only Mode

```bash
# Disable write operations (useful for shared databases)
export PROJECT_MEMORY_READ_ONLY=true
```

### 4. Logging & Monitoring

#### Enable Audit Logging

```bash
# Log all operations for audit
export PROJECT_MEMORY_LOG_LEVEL=INFO
export PROJECT_MEMORY_AUDIT_LOG=/var/log/mcp-audit.log
```

#### Monitor for Anomalies

Watch for:
- Unusual rate of operations
- Large data exports
- Failed authentication attempts
- Attempts to store secrets

---

## Security Checklist

### Deployment Checklist

- [ ] Database file permissions set to 600
- [ ] Database directory permissions set to 700
- [ ] Rate limiting configured appropriately
- [ ] Size limits reviewed for your use case
- [ ] Logging enabled for audit trail
- [ ] Backup strategy implemented
- [ ] Encryption enabled for sensitive projects

### Operational Security

- [ ] Regular review of stored decisions for secrets
- [ ] Periodic purge of outdated data
- [ ] Monitor disk usage
- [ ] Review export operations
- [ ] Test restore from backup

### Code Review for Stored Content

Before storing, verify:
- [ ] No API keys or secrets in decision text
- [ ] No passwords in pattern examples
- [ ] No PII in context values
- [ ] No internal URLs or paths that shouldn't be shared

---

## Known Vulnerabilities & Mitigations

### MCP Protocol-Level Issues (June 2025 Research)

| Issue | Status | Mitigation |
|-------|--------|------------|
| Tool Combining Exfiltration | Mitigated | Single-tool server design |
| Lookalike Tools | Not Applicable | Self-contained server |
| Over-Permissioning | Mitigated | Minimal permission set |
| Prompt Injection | Partially Mitigated | Input sanitization |

### Recommended Additional Protections

1. **Content Scanning**: Integrate with secrets detection
   ```bash
   # Scan exports for secrets before sharing
   detect-secrets scan export.json
   ```

2. **Network Isolation**: Run in isolated network for team deployments

3. **Regular Updates**: Keep MCP SDK and server updated
   ```bash
   pip install --upgrade mcp
   ```

---

## Incident Response

### If Secrets Are Accidentally Stored

1. **Immediately** purge affected data:
   ```
   Tool: purge_memory
   Arguments: {"confirm": "CONFIRM_PURGE"}
   ```

2. **Rotate** any exposed credentials

3. **Review** access logs for data access

4. **Update** patterns to prevent recurrence

### If Database Is Compromised

1. **Isolate** the system
2. **Preserve** logs for forensics
3. **Reset** database with fresh initialization
4. **Review** all decisions/patterns that were stored
5. **Notify** team members if team deployment

---

## References

- [Anthropic MCP Security](https://www.anthropic.com/news/model-context-protocol)
- [OWASP Injection Prevention](https://owasp.org/www-community/Injection_Prevention_Cheat_Sheet)
- [SQLite Security](https://sqlite.org/security.html)
- [MCP Authorization Specification (June 2025)](https://modelcontextprotocol.io/)

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.1.0 | 2024-12-30 | Added connection pooling, rate limiting |
| 1.0.0 | 2024-12-29 | Initial security documentation |
