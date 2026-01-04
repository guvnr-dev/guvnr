# MCP OAuth & Authorization Guide

> Implementing OAuth-based authorization for MCP servers (June 2025 Specification)

## Overview

The MCP June 2025 specification introduced OAuth-based authorization as the standard authentication mechanism for MCP servers. This guide covers implementation patterns and security best practices.

## Key Changes (June 2025)

### MCP Servers as OAuth Resource Servers

MCP servers are now officially classified as **OAuth Resource Servers** per RFC 6749. This has significant implications:

1. **Token Validation**: MCP servers must validate OAuth access tokens
2. **Scope Enforcement**: Servers must check token scopes before allowing tool execution
3. **RFC 8707 Compliance**: Resource Indicators are required to prevent token mis-redemption

### Required Implementations

```json
{
  "mcpServers": {
    "secure-server": {
      "command": "npx",
      "args": ["-y", "@example/mcp-server"],
      "auth": {
        "type": "oauth2",
        "authorization_endpoint": "https://auth.example.com/authorize",
        "token_endpoint": "https://auth.example.com/token",
        "scopes": ["read", "write", "admin"],
        "resource_indicator": "https://api.example.com"
      }
    }
  }
}
```

## OAuth 2.0 Flow for MCP

### Authorization Code Flow (Recommended)

```
┌─────────┐                                    ┌─────────────┐
│  User   │                                    │  Auth Server│
└────┬────┘                                    └──────┬──────┘
     │                                                │
     │  1. User requests tool access                  │
     │────────────────────────────────────────────────>
     │                                                │
     │  2. Auth server redirects to login             │
     │<────────────────────────────────────────────────
     │                                                │
     │  3. User authenticates                         │
     │────────────────────────────────────────────────>
     │                                                │
     │  4. Auth server returns authorization code     │
     │<────────────────────────────────────────────────
     │                                                │
     │  5. Exchange code for access token             │
     │────────────────────────────────────────────────>
     │                                                │
     │  6. Access token returned                      │
     │<────────────────────────────────────────────────
     │                                                │
     │  7. Call MCP server with token                 │
     │                                                │
```

### Token Requirements

| Requirement      | Description                              |
| ---------------- | ---------------------------------------- |
| **Token Type**   | Bearer tokens (RFC 6750)                 |
| **Token Format** | JWT recommended for self-validation      |
| **Expiration**   | Short-lived (15 minutes recommended)     |
| **Refresh**      | Refresh tokens for long-running sessions |
| **Revocation**   | RFC 7009 revocation endpoint support     |

## Resource Indicators (RFC 8707)

### Why Resource Indicators?

Without resource indicators, a token issued for one API could be misused at another. RFC 8707 prevents this "token mis-redemption" attack.

### Implementation

When requesting tokens, include the `resource` parameter:

```http
POST /token HTTP/1.1
Host: auth.example.com
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code&
code=AUTHORIZATION_CODE&
redirect_uri=https://app.example.com/callback&
resource=https://mcp.example.com/tools
```

### MCP Client Requirements

MCP clients MUST:

1. Include resource indicators in all token requests
2. Validate that tokens are issued for the correct resource
3. Reject tokens that don't match the target MCP server

## Elicitation: Server-Initiated User Interactions

### Overview

Elicitation allows MCP servers to request additional information from users during tool execution. This is useful when:

- A tool needs clarification on ambiguous inputs
- User confirmation is required for sensitive operations
- Additional authentication is needed mid-operation

### Elicitation Flow

```
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│  MCP Client  │     │  MCP Server  │     │     User     │
└──────┬───────┘     └──────┬───────┘     └──────┬───────┘
       │                    │                    │
       │ 1. Call tool       │                    │
       │───────────────────>│                    │
       │                    │                    │
       │ 2. Elicitation     │                    │
       │    request         │                    │
       │<───────────────────│                    │
       │                    │                    │
       │ 3. Display prompt  │                    │
       │────────────────────│───────────────────>│
       │                    │                    │
       │ 4. User response   │                    │
       │<───────────────────│────────────────────│
       │                    │                    │
       │ 5. Continue with   │                    │
       │    response        │                    │
       │───────────────────>│                    │
       │                    │                    │
       │ 6. Final result    │                    │
       │<───────────────────│                    │
```

### Elicitation Types

| Type        | Use Case                    |
| ----------- | --------------------------- |
| **text**    | Free-form text input        |
| **select**  | Choose from options         |
| **confirm** | Yes/No confirmation         |
| **secret**  | Password or sensitive input |
| **file**    | File selection/upload       |

### Example: Confirmation Elicitation

```json
{
  "type": "elicitation",
  "elicitation_id": "confirm-delete-123",
  "prompt": {
    "type": "confirm",
    "title": "Confirm Deletion",
    "message": "Are you sure you want to delete 47 files? This cannot be undone.",
    "default": false
  }
}
```

### Security Considerations

- **Timeout**: Elicitation requests should timeout after reasonable period
- **Rate Limiting**: Prevent elicitation spam
- **Context Preservation**: Maintain security context across elicitation
- **Audit Logging**: Log all elicitation requests and responses

## Structured Tool Outputs

### Overview

The June 2025 specification also introduced structured tool outputs, allowing tools to return rich, typed data instead of just strings.

### Output Schema

```json
{
  "type": "structured_output",
  "schema": {
    "type": "object",
    "properties": {
      "status": { "type": "string", "enum": ["success", "partial", "failed"] },
      "data": { "type": "array", "items": { "type": "object" } },
      "metadata": {
        "type": "object",
        "properties": {
          "execution_time_ms": { "type": "number" },
          "records_processed": { "type": "integer" }
        }
      }
    }
  }
}
```

### Benefits

1. **Type Safety**: Clients can validate outputs against schema
2. **Rich Data**: Complex structures instead of serialized strings
3. **Streaming**: Structured outputs support incremental delivery
4. **Interoperability**: Standard format across implementations

## Implementation Checklist

### For MCP Server Authors

- [ ] Implement OAuth 2.0 token validation
- [ ] Validate resource indicators on all requests
- [ ] Support token revocation checking
- [ ] Implement elicitation for user interactions
- [ ] Return structured outputs with schemas
- [ ] Add proper error responses for auth failures

### For MCP Client Authors

- [ ] Implement OAuth 2.0 authorization code flow
- [ ] Include resource indicators in token requests
- [ ] Handle elicitation requests gracefully
- [ ] Parse structured outputs according to schemas
- [ ] Implement token refresh logic
- [ ] Support token revocation

## Security Best Practices

### Token Storage

```javascript
// Good: Encrypted storage with expiration
const tokenStore = {
  async save(token) {
    const encrypted = await encrypt(token, secretKey);
    await secureStorage.set('mcp_token', encrypted, {
      expires: token.expires_at
    });
  }
};

// Bad: Plain localStorage
localStorage.setItem('mcp_token', token); // DON'T DO THIS
```

### Scope Minimization

Request only the scopes you need:

```json
{
  "scopes": ["tools:read", "tools:execute"], // Good: minimal scopes
  "scopes": ["admin"] // Bad: over-privileged
}
```

### Token Validation

```python
def validate_token(token: str, resource: str) -> bool:
    """Validate MCP access token."""
    try:
        # Decode and verify signature
        payload = jwt.decode(token, public_key, algorithms=['RS256'])

        # Check expiration
        if payload['exp'] < time.time():
            return False

        # Verify resource indicator (RFC 8707)
        if payload.get('aud') != resource:
            return False

        return True
    except jwt.InvalidTokenError:
        return False
```

## Resources

- [RFC 6749 - OAuth 2.0](https://datatracker.ietf.org/doc/html/rfc6749)
- [RFC 6750 - Bearer Tokens](https://datatracker.ietf.org/doc/html/rfc6750)
- [RFC 8707 - Resource Indicators](https://datatracker.ietf.org/doc/html/rfc8707)
- [MCP June 2025 Specification](https://modelcontextprotocol.io/specification/2025-06-18)
- [MCP Security Best Practices](./MCP-SECURITY.md)

---

_Part of the [AI Excellence Framework](https://github.com/ai-excellence-framework/ai-excellence-framework)_
