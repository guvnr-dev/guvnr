# MCP Registry Submission

This document contains the information needed to submit the AI Excellence Framework's MCP server to the official [MCP Registry](https://github.com/modelcontextprotocol/servers).

## Server Information

### Name

`project-memory-server`

### Short Description

Production-ready project memory server with SQLite persistence, connection pooling, and team collaboration features.

### Full Description

A comprehensive MCP server for maintaining project context across AI coding sessions. Features include:

- **Persistent Storage**: SQLite with WAL mode for concurrent access
- **Decision Tracking**: Full-text search across architectural decisions
- **Pattern Library**: Store and retrieve coding patterns
- **Context Management**: Key-value store for session context
- **Connection Pooling**: Thread-safe pool for team deployments
- **Rate Limiting**: Configurable protection (default: 100 ops/min)
- **Export/Import**: Backup and portability support
- **Health Checks**: Database integrity verification

Part of the [AI Excellence Framework](https://github.com/ai-excellence-framework/ai-excellence-framework).

### Category

`memory` / `developer-tools`

### Tags

- memory
- project-context
- developer-tools
- sqlite
- team-collaboration
- session-persistence

## Technical Details

### Language

Python 3.9+

### Dependencies

```
mcp>=1.0.0
```

### Installation

```bash
# Via AI Excellence Framework CLI
npx ai-excellence-framework init --preset full

# Or manually
pip install mcp
python scripts/mcp/project-memory-server.py
```

### Configuration

```bash
# Environment variables
PROJECT_MEMORY_DB=".project-memory.db"  # Database location
PROJECT_MEMORY_MAX_DECISIONS=1000        # Max decisions to store
PROJECT_MEMORY_MAX_PATTERNS=100          # Max patterns to store
PROJECT_MEMORY_POOL_SIZE=5               # Connection pool size
PROJECT_MEMORY_RATE_LIMIT=100            # Operations per minute
```

### Tools Provided

| Tool | Description |
|------|-------------|
| `store_decision` | Store an architectural/technical decision |
| `search_decisions` | Full-text search across decisions |
| `get_recent_decisions` | Retrieve recent decisions |
| `store_pattern` | Store a coding pattern |
| `get_patterns` | Retrieve patterns by name |
| `store_context` | Store key-value context |
| `get_context` | Retrieve context by key |
| `get_all_context` | Retrieve all context |
| `clear_context` | Clear context data |
| `export_memory` | Export all data to JSON |
| `import_memory` | Import data from JSON |
| `get_stats` | Get memory statistics |
| `health_check` | Verify database health |

### Resources Provided

| Resource | Description |
|----------|-------------|
| `memory://decisions` | All stored decisions |
| `memory://patterns` | All stored patterns |
| `memory://context` | Current context |
| `memory://stats` | Memory statistics |

## Security Considerations

See [MCP-SECURITY.md](./MCP-SECURITY.md) for comprehensive security documentation.

Key security features:

- Input sanitization for all user-provided data
- SQL parameterization (no injection vulnerabilities)
- Rate limiting to prevent abuse
- Local-only by default (no network exposure)
- WAL mode for corruption resistance

## Repository Information

- **Repository**: https://github.com/ai-excellence-framework/ai-excellence-framework
- **License**: MIT
- **Maintainers**: AI Excellence Framework Contributors
- **Issues**: https://github.com/ai-excellence-framework/ai-excellence-framework/issues

## Submission Checklist

- [x] Server follows MCP specification
- [x] Documentation complete
- [x] Security considerations documented
- [x] Installation instructions provided
- [x] Configuration options documented
- [x] Tools and resources listed
- [x] Repository is public
- [x] MIT licensed
- [x] Tests included

## How to Submit

1. Fork [modelcontextprotocol/servers](https://github.com/modelcontextprotocol/servers)
2. Add entry to `servers.json`:

```json
{
  "name": "project-memory-server",
  "description": "Production-ready project memory with SQLite, connection pooling, and team collaboration",
  "repository": "https://github.com/ai-excellence-framework/ai-excellence-framework",
  "path": "scripts/mcp/project-memory-server.py",
  "language": "python",
  "categories": ["memory", "developer-tools"],
  "tags": ["memory", "sqlite", "team", "session-persistence"]
}
```

3. Create pull request

## Contact

For questions about this submission, open an issue in the [AI Excellence Framework repository](https://github.com/ai-excellence-framework/ai-excellence-framework/issues).
