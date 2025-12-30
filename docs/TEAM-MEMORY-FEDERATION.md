# Team Memory Federation

This guide covers sharing project memory across team members using the MCP server federation capabilities.

## Overview

Team Memory Federation enables:
- Shared decisions and rationale across developers
- Consistent pattern adoption team-wide
- Context preservation during handoffs
- Cross-project insights for organizations

---

## Architecture

### Single Developer (Default)

```
┌─────────────────────────────────────┐
│          Developer Machine          │
│  ┌─────────────┐  ┌──────────────┐ │
│  │ Claude Code │──│ MCP Server   │ │
│  └─────────────┘  │ (SQLite)     │ │
│                   │ ~/.claude/   │ │
│                   │ memories/    │ │
│                   └──────────────┘ │
└─────────────────────────────────────┘
```

### Team Federation

```
┌─────────────────────────────────────────────────────────────┐
│                    Shared Infrastructure                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              Federated MCP Server                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐     │   │
│  │  │ Project A  │  │ Project B  │  │ Project C  │     │   │
│  │  │ Memory DB  │  │ Memory DB  │  │ Memory DB  │     │   │
│  │  └────────────┘  └────────────┘  └────────────┘     │   │
│  │                                                       │   │
│  │  ┌─────────────────────────────────────────────────┐ │   │
│  │  │           Cross-Project Insights                │ │   │
│  │  │  (Patterns, Best Practices, Lessons Learned)   │ │   │
│  │  └─────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
         ▲              ▲              ▲
         │              │              │
    ┌────┴────┐    ┌────┴────┐    ┌────┴────┐
    │  Dev 1  │    │  Dev 2  │    │  Dev 3  │
    │ Claude  │    │ Claude  │    │ Claude  │
    └─────────┘    └─────────┘    └─────────┘
```

---

## Setup Options

### Option 1: Shared Network Storage

Simplest approach for co-located teams.

```bash
# Configure shared storage path
export PROJECT_MEMORY_DB=/shared/team/project-memories/myproject.db

# Or in ai-excellence.config.json
{
  "mcp": {
    "dbPath": "/shared/team/project-memories/${PROJECT_NAME}.db"
  }
}
```

**Requirements:**
- Network file system (NFS, SMB, EFS)
- SQLite WAL mode (enabled by default)
- Appropriate file permissions

**Limitations:**
- All team members need network access
- Latency on slow connections
- No offline access

### Option 2: Git-Synced Memory

Export/import memory through git.

#### Export Memory

```bash
# In your project
python3 scripts/mcp/project-memory-server.py --export > .memory/decisions.json

# Add to git
git add .memory/decisions.json
git commit -m "chore: sync team memory"
git push
```

#### Import Memory

```bash
# After pulling updates
git pull
python3 scripts/mcp/project-memory-server.py --import .memory/decisions.json --merge
```

#### Automated Sync Hook

Add to `.git/hooks/post-merge`:

```bash
#!/bin/bash
# Auto-import memory after git pull
if [ -f ".memory/decisions.json" ]; then
  echo "Syncing team memory..."
  python3 scripts/mcp/project-memory-server.py --import .memory/decisions.json --merge
fi
```

Add to `.git/hooks/pre-push`:

```bash
#!/bin/bash
# Auto-export memory before git push
echo "Exporting team memory..."
python3 scripts/mcp/project-memory-server.py --export > .memory/decisions.json
git add .memory/decisions.json
```

### Option 3: Central MCP Server

Enterprise setup with dedicated server.

#### Server Setup

```yaml
# docker-compose.yml
version: '3.8'
services:
  mcp-server:
    build: ./scripts/mcp
    ports:
      - "8080:8080"
    volumes:
      - mcp-data:/data
    environment:
      - PROJECT_MEMORY_DB=/data/memories.db
      - PROJECT_MEMORY_POOL_SIZE=20
      - PROJECT_MEMORY_RATE_LIMIT=1000
      - MCP_AUTH_TOKEN=${MCP_AUTH_TOKEN}
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8080/health"]
      interval: 30s
      timeout: 10s
      retries: 3

volumes:
  mcp-data:
```

#### Client Configuration

```json
// ~/.claude/settings.json
{
  "mcpServers": {
    "project-memory": {
      "url": "https://mcp.company.internal:8080",
      "headers": {
        "Authorization": "Bearer ${MCP_AUTH_TOKEN}"
      }
    }
  }
}
```

### Option 4: Cloud-Synced (PostgreSQL Backend)

For distributed teams needing real-time sync.

```python
# Modified MCP server with PostgreSQL backend
# scripts/mcp/project-memory-server-pg.py

import asyncpg

class PostgresMemoryDB:
    def __init__(self, connection_string: str):
        self.conn_string = connection_string
        self.pool = None

    async def connect(self):
        self.pool = await asyncpg.create_pool(
            self.conn_string,
            min_size=5,
            max_size=20
        )

    async def add_decision(self, decision: str, rationale: str, **kwargs):
        async with self.pool.acquire() as conn:
            return await conn.fetchval("""
                INSERT INTO decisions (project, decision, rationale, context, alternatives)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING id
            """, self.project, decision, rationale,
                kwargs.get('context', ''), kwargs.get('alternatives', ''))
```

---

## Federation Features

### Cross-Project Patterns

Share patterns across multiple projects in your organization.

```python
# Query patterns from all projects
async def get_org_patterns(org_id: str) -> List[Pattern]:
    async with pool.acquire() as conn:
        return await conn.fetch("""
            SELECT DISTINCT p.name, p.description, p.example, p.when_to_use
            FROM patterns p
            JOIN projects proj ON p.project_id = proj.id
            WHERE proj.org_id = $1
            ORDER BY p.usage_count DESC
            LIMIT 50
        """, org_id)
```

### Decision Impact Tracking

Track which decisions had positive or negative outcomes.

```json
{
  "decision": "Use Redis for caching",
  "rationale": "Need sub-millisecond latency for user sessions",
  "outcome": {
    "status": "successful",
    "impact": "Reduced p99 latency from 150ms to 8ms",
    "lessons": "Needed to handle Redis connection failures gracefully"
  },
  "related_decisions": ["decision-123", "decision-456"]
}
```

### Conflict Resolution

When merging memories from multiple sources:

```python
class ConflictResolver:
    """Resolve conflicts when merging memory databases."""

    def merge_decisions(self, local: List[Decision], remote: List[Decision]) -> List[Decision]:
        """
        Merge strategy:
        1. Keep all unique decisions (by content hash)
        2. For duplicates, keep the one with more context
        3. Preserve newer timestamps
        """
        merged = {}
        for d in local + remote:
            key = self._hash_decision(d)
            if key not in merged or len(d.context) > len(merged[key].context):
                merged[key] = d
        return list(merged.values())

    def merge_patterns(self, local: List[Pattern], remote: List[Pattern]) -> List[Pattern]:
        """
        Merge strategy:
        1. Patterns are keyed by name
        2. Keep the version with more complete documentation
        3. Preserve examples from both if different
        """
        merged = {}
        for p in local:
            merged[p.name] = p
        for p in remote:
            if p.name not in merged:
                merged[p.name] = p
            else:
                merged[p.name] = self._merge_pattern(merged[p.name], p)
        return list(merged.values())
```

---

## Access Control

### Role-Based Access

```yaml
# mcp-access-config.yaml
roles:
  admin:
    permissions:
      - read
      - write
      - delete
      - export
      - import
      - purge

  developer:
    permissions:
      - read
      - write
      - export

  viewer:
    permissions:
      - read

projects:
  myproject:
    admins:
      - alice@company.com
    developers:
      - bob@company.com
      - charlie@company.com
    viewers:
      - diana@company.com
```

### API Key Management

```bash
# Generate project-specific API key
./scripts/mcp/generate-api-key.sh --project myproject --role developer --expires 90d

# Output:
# API Key: aix_dev_abc123...
# Project: myproject
# Role: developer
# Expires: 2026-03-30
#
# Add to ~/.claude/settings.json:
# "mcpServers": {
#   "project-memory": {
#     "env": { "MCP_API_KEY": "aix_dev_abc123..." }
#   }
# }
```

---

## Best Practices

### 1. Decision Naming Conventions

```
# Good decision names
"Use TypeScript strict mode for type safety"
"Implement rate limiting with token bucket algorithm"
"Adopt conventional commits for changelog generation"

# Poor decision names
"Change the thing"
"Fix it"
"Update config"
```

### 2. Pattern Documentation

```json
{
  "name": "error-boundary",
  "description": "React error boundary pattern for graceful failure handling",
  "example": "class ErrorBoundary extends React.Component {\n  state = { hasError: false };\n  static getDerivedStateFromError(error) {\n    return { hasError: true };\n  }\n  componentDidCatch(error, info) {\n    logError(error, info);\n  }\n  render() {\n    return this.state.hasError\n      ? <FallbackUI />\n      : this.props.children;\n  }\n}",
  "when_to_use": "Wrap components that might throw errors during rendering. Use at route boundaries and around third-party components."
}
```

### 3. Regular Cleanup

```bash
# Weekly cleanup script
#!/bin/bash

# Archive old decisions (>6 months)
python3 scripts/mcp/project-memory-server.py \
  --archive --older-than 180d \
  --output archives/$(date +%Y-%m).json

# Deduplicate patterns
python3 scripts/mcp/project-memory-server.py \
  --deduplicate-patterns

# Compact database
python3 scripts/mcp/project-memory-server.py \
  --vacuum
```

### 4. Handoff Protocol

When handing off to a teammate:

```bash
# Export your session context
./scripts/mcp/project-memory-server.py --export-session > handoff-$(date +%Y%m%d).json

# Include in handoff message:
# 1. What was accomplished
# 2. What's in progress
# 3. Key decisions made
# 4. Blockers encountered
# 5. Suggested next steps
```

---

## Monitoring

### Health Metrics

```prometheus
# MCP server metrics (Prometheus format)
mcp_memory_decisions_total{project="myproject"} 423
mcp_memory_patterns_total{project="myproject"} 28
mcp_memory_context_keys{project="myproject"} 15
mcp_memory_db_size_bytes{project="myproject"} 1048576
mcp_memory_pool_connections_active{project="myproject"} 3
mcp_memory_pool_connections_idle{project="myproject"} 2
mcp_memory_rate_limit_remaining{project="myproject"} 95
mcp_memory_queries_total{project="myproject",status="success"} 1523
mcp_memory_queries_total{project="myproject",status="error"} 7
```

### Alerting

```yaml
# alertmanager rules
groups:
  - name: mcp-memory
    rules:
      - alert: MCPMemoryNearCapacity
        expr: mcp_memory_decisions_total / mcp_memory_decisions_limit > 0.9
        for: 1h
        labels:
          severity: warning
        annotations:
          summary: "MCP memory approaching capacity"
          description: "Project {{ $labels.project }} is at {{ $value }}% decision capacity"

      - alert: MCPServerUnhealthy
        expr: up{job="mcp-memory"} == 0
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "MCP server is down"
```

---

## Migration Guide

### From Local to Federated

1. **Export existing memory:**
   ```bash
   python3 scripts/mcp/project-memory-server.py --export > local-memory.json
   ```

2. **Configure federation:**
   ```bash
   export PROJECT_MEMORY_DB=/shared/team/memories/project.db
   ```

3. **Import to shared location:**
   ```bash
   python3 scripts/mcp/project-memory-server.py --import local-memory.json
   ```

4. **Verify migration:**
   ```bash
   python3 scripts/mcp/project-memory-server.py --health
   ```

5. **Update team configuration:**
   ```bash
   git add ai-excellence.config.json
   git commit -m "feat: enable team memory federation"
   ```

### From SQLite to PostgreSQL

1. **Export from SQLite:**
   ```bash
   python3 scripts/mcp/project-memory-server.py --export > sqlite-export.json
   ```

2. **Set up PostgreSQL:**
   ```sql
   CREATE DATABASE mcp_memory;
   \c mcp_memory
   \i scripts/mcp/schema.sql
   ```

3. **Import to PostgreSQL:**
   ```bash
   export DATABASE_URL=postgresql://user:pass@host:5432/mcp_memory
   python3 scripts/mcp/project-memory-server-pg.py --import sqlite-export.json
   ```

---

## Security Considerations

1. **Encrypt at rest**: Enable database encryption for sensitive decisions
2. **Encrypt in transit**: Use TLS for remote MCP connections
3. **Audit logging**: Log all memory access for compliance
4. **Data retention**: Implement automatic purging of old data
5. **Access reviews**: Regularly review who has access to project memory

---

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Sync conflicts | Use `--merge` flag with conflict resolution |
| Slow queries | Index frequently searched fields |
| Connection pool exhausted | Increase `PROJECT_MEMORY_POOL_SIZE` |
| Rate limited | Wait or increase `PROJECT_MEMORY_RATE_LIMIT` |
| Database locked | Check for hung connections; restart server |
| Import fails | Validate JSON format; check schema version |

---

## Sources

- [SQLite WAL Mode](https://sqlite.org/wal.html)
- [PostgreSQL Connection Pooling](https://www.postgresql.org/docs/current/runtime-config-connection.html)
- [Model Context Protocol Specification](https://spec.modelcontextprotocol.io/)
