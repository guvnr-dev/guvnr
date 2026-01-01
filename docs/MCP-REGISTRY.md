# MCP Registry Integration Guide

This guide covers how to discover, install, and use MCP servers from the official MCP Registry and other catalogs.

## Overview

The MCP Registry is the official catalog and API for publicly available MCP servers, launched in September 2025 and progressing toward general availability.

**Official Registry**: [registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io)

## Available Registries

| Registry | Description | Servers |
|----------|-------------|---------|
| [MCP Registry](https://registry.modelcontextprotocol.io) | Official community registry | 1,000+ |
| [Docker MCP Catalog](https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/) | Containerized MCP servers | Hundreds |
| [GitHub MCP Registry](https://github.com/modelcontextprotocol/registry) | Enterprise-focused servers | 40+ |
| [Postman MCP Catalog](https://www.postman.com) | API-focused MCP servers | Growing |

## Finding Servers

### Using the Official Registry

```bash
# Browse the registry
open https://registry.modelcontextprotocol.io

# Or use the API
curl https://registry.modelcontextprotocol.io/api/servers
```

### Registry API (v0.1)

```bash
# List all servers
GET /api/servers

# Search servers
GET /api/servers?q=memory&category=developer-tools

# Get server details
GET /api/servers/{server-id}
```

### Response Format

```json
{
  "servers": [
    {
      "id": "project-memory",
      "name": "Project Memory Server",
      "description": "Persistent memory for AI coding sessions",
      "repository": "https://github.com/example/project-memory",
      "categories": ["memory", "developer-tools"],
      "tags": ["sqlite", "session-persistence"],
      "language": "python",
      "install": {
        "npx": "npx -y @example/project-memory",
        "pip": "pip install project-memory-mcp"
      }
    }
  ]
}
```

## Installing MCP Servers

### NPM-based Servers

Most MCP servers can be installed via npx:

```json
// claude_desktop_config.json or .mcp.json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "--allowed-directories", "."]
    },
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### Python-based Servers

```json
{
  "mcpServers": {
    "project-memory": {
      "command": "python",
      "args": ["-m", "project_memory_server"],
      "env": {
        "PROJECT_MEMORY_DB": ".project-memory.db"
      }
    }
  }
}
```

### Docker-based Servers

```json
{
  "mcpServers": {
    "postgres": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "mcp/postgres:latest"],
      "env": {
        "DATABASE_URL": "${DATABASE_URL}"
      }
    }
  }
}
```

## Popular MCP Servers

### Official Anthropic Servers

| Server | Description | Install |
|--------|-------------|---------|
| Memory | Persistent key-value memory | `npx -y @anthropic-ai/mcp-server-memory` |
| Filesystem | File operations | `npx -y @anthropic-ai/mcp-server-filesystem` |
| Git | Git operations | `npx -y @anthropic-ai/mcp-server-git` |
| GitHub | GitHub API integration | `npx -y @anthropic-ai/mcp-server-github` |
| PostgreSQL | Database operations | `npx -y @anthropic-ai/mcp-server-postgres` |
| SQLite | SQLite database access | `npx -y @anthropic-ai/mcp-server-sqlite` |
| Fetch | HTTP requests | `npx -y @anthropic-ai/mcp-server-fetch` |
| Puppeteer | Browser automation | `npx -y @anthropic-ai/mcp-server-puppeteer` |
| Slack | Slack integration | `npx -y @anthropic-ai/mcp-server-slack` |

### Community Servers

| Server | Description | Category |
|--------|-------------|----------|
| Brave Search | Web search via Brave | Search |
| Obsidian | Note-taking integration | Knowledge |
| Linear | Project management | Productivity |
| Notion | Workspace integration | Productivity |
| Sentry | Error tracking | DevOps |
| AWS | AWS service access | Cloud |

## Configuration Best Practices

### 1. Environment Variable Management

```bash
# .env file (never commit!)
GITHUB_TOKEN=ghp_xxxxx
DATABASE_URL=postgres://user:pass@localhost/db
SLACK_TOKEN=xoxb-xxxxx
```

```json
// MCP config referencing env vars
{
  "mcpServers": {
    "github": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-github"],
      "env": {
        "GITHUB_TOKEN": "${GITHUB_TOKEN}"
      }
    }
  }
}
```

### 2. Scoped Permissions

Limit filesystem access:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": [
        "-y", "@anthropic-ai/mcp-server-filesystem",
        "--allowed-directories", "./src,./docs",
        "--read-only-directories", "./config"
      ]
    }
  }
}
```

### 3. Rate Limiting

For shared environments:

```json
{
  "mcpServers": {
    "api-server": {
      "command": "npx",
      "args": ["-y", "@example/api-mcp"],
      "env": {
        "RATE_LIMIT": "100",
        "RATE_LIMIT_WINDOW": "60"
      }
    }
  }
}
```

## Creating Sub-Registries

Organizations can create sub-registries based on the official OpenAPI specification:

```yaml
# sub-registry-config.yaml
base_registry: https://registry.modelcontextprotocol.io
filters:
  categories:
    - developer-tools
    - security
  require_verified: true
  exclude_experimental: true
```

## Security Considerations

### Before Installing Any MCP Server

1. **Verify Source**
   - Check the repository is legitimate
   - Review stars, contributors, and activity
   - Look for security audits if available

2. **Review Permissions**
   - What filesystem access does it need?
   - What network access does it require?
   - What environment variables does it read?

3. **Check for Vulnerabilities**
   ```bash
   # For npm packages
   npm audit @example/mcp-server

   # For Python packages
   pip-audit project-memory-mcp
   ```

4. **Use Minimal Permissions**
   - Only grant access to required directories
   - Use read-only mode when possible
   - Limit network access if not needed

### Server Security Checklist

- [ ] Server is from trusted source
- [ ] No known vulnerabilities
- [ ] Permissions are minimally scoped
- [ ] Sensitive data is not exposed
- [ ] Rate limiting is configured
- [ ] Logs don't contain secrets

## Integration with AI Excellence Framework

### Recommended Server Stack

```json
// .mcp.json for AI Excellence Framework projects
{
  "mcpServers": {
    "project-memory": {
      "command": "python",
      "args": ["scripts/mcp/project-memory-server.py"],
      "description": "Project decisions and patterns"
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "--allowed-directories", "."],
      "description": "File operations"
    },
    "git": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-git"],
      "description": "Git operations"
    }
  }
}
```

### Discovery Script

```bash
#!/bin/bash
# scripts/discover-mcp-servers.sh
# Discover available MCP servers for your project

echo "🔍 Discovering MCP servers..."

# Check official registry
curl -s https://registry.modelcontextprotocol.io/api/servers \
  | jq '.servers[] | select(.categories | contains(["developer-tools"])) | .name'

# Check Docker Hub
docker search mcp --limit 10
```

## Troubleshooting

### Server Won't Start

```bash
# Check if command exists
which npx

# Test server manually
npx -y @anthropic-ai/mcp-server-memory --help

# Check environment variables
env | grep -E "^(GITHUB|DATABASE|PROJECT)"
```

### Connection Issues

```bash
# Enable debug logging
export MCP_DEBUG=1

# Check server logs
tail -f ~/.mcp/logs/server.log
```

### Permission Errors

```bash
# Verify directory permissions
ls -la ~/.mcp/

# Check file ownership
stat scripts/mcp/project-memory-server.py
```

## Related Documentation

- [MCP Registry GitHub](https://github.com/modelcontextprotocol/registry)
- [Docker MCP Catalog](https://docs.docker.com/ai/mcp-catalog-and-toolkit/catalog/)
- [MCP Security Guide](./MCP-SECURITY.md)
- [MCP Tasks Guide](./MCP-TASKS.md)
- [Project Memory Server](./MCP-REGISTRY-SUBMISSION.md)

---

_Last Updated: January 2026_
_Registry API Version: v0.1_
