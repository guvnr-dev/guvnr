# PostgreSQL Deployment Guide

This guide covers deploying the Project Memory MCP Server with PostgreSQL for large-scale team deployments.

## When to Use PostgreSQL

| Scenario              | Recommendation | Reason                            |
| --------------------- | -------------- | --------------------------------- |
| Individual developer  | SQLite         | Zero setup, built-in              |
| Small team (2-10)     | SQLite + WAL   | Sufficient concurrency            |
| Medium team (10-50)   | PostgreSQL     | Better concurrent writes          |
| Large team (50+)      | PostgreSQL     | Required for scale                |
| Multi-region          | PostgreSQL     | Replication support               |
| Enterprise compliance | PostgreSQL     | Audit logging, encryption at rest |

## Prerequisites

- PostgreSQL 14+ installed and running
- Python 3.9+ with `psycopg2` or `asyncpg`
- Network access to PostgreSQL server

## Quick Setup

### 1. Install Dependencies

```bash
# For synchronous driver (simpler)
pip install psycopg2-binary

# For async driver (better performance)
pip install asyncpg
```

### 2. Create Database

```sql
-- Connect as postgres admin
CREATE DATABASE project_memory;
CREATE USER mcp_server WITH ENCRYPTED PASSWORD 'secure_password_here';
GRANT ALL PRIVILEGES ON DATABASE project_memory TO mcp_server;

-- Connect to project_memory database
\c project_memory

-- Create schema
CREATE SCHEMA IF NOT EXISTS mcp;
GRANT ALL ON SCHEMA mcp TO mcp_server;
```

### 3. Initialize Schema

```sql
-- Decisions table
CREATE TABLE IF NOT EXISTS mcp.decisions (
    id SERIAL PRIMARY KEY,
    decision TEXT NOT NULL,
    reasoning TEXT,
    timestamp TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    tags TEXT[] DEFAULT '{}',
    search_vector TSVECTOR GENERATED ALWAYS AS (
        to_tsvector('english', decision || ' ' || COALESCE(reasoning, ''))
    ) STORED
);

CREATE INDEX idx_decisions_search ON mcp.decisions USING GIN (search_vector);
CREATE INDEX idx_decisions_timestamp ON mcp.decisions (timestamp DESC);
CREATE INDEX idx_decisions_tags ON mcp.decisions USING GIN (tags);

-- Patterns table
CREATE TABLE IF NOT EXISTS mcp.patterns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    description TEXT,
    example TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Context table
CREATE TABLE IF NOT EXISTS mcp.context (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Version tracking
CREATE TABLE IF NOT EXISTS mcp.metadata (
    key VARCHAR(255) PRIMARY KEY,
    value TEXT NOT NULL
);

INSERT INTO mcp.metadata (key, value) VALUES ('schema_version', '1.0.0')
ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value;
```

### 4. Configure Environment

```bash
# Add to .env or environment
export PROJECT_MEMORY_DB_TYPE=postgresql
export PROJECT_MEMORY_DB_HOST=localhost
export PROJECT_MEMORY_DB_PORT=5432
export PROJECT_MEMORY_DB_NAME=project_memory
export PROJECT_MEMORY_DB_USER=mcp_server
export PROJECT_MEMORY_DB_PASSWORD=secure_password_here
export PROJECT_MEMORY_POOL_SIZE=10
export PROJECT_MEMORY_RATE_LIMIT=500
```

### 5. PostgreSQL Adapter

Create `scripts/mcp/pg_adapter.py`:

```python
#!/usr/bin/env python3
"""PostgreSQL adapter for Project Memory MCP Server."""

import os
import psycopg2
from psycopg2 import pool
from contextlib import contextmanager
from typing import Any, Generator, List, Dict, Optional

class PostgreSQLMemoryStore:
    """PostgreSQL-backed memory store for large team deployments."""

    def __init__(self):
        self.connection_pool = pool.ThreadedConnectionPool(
            minconn=2,
            maxconn=int(os.environ.get("PROJECT_MEMORY_POOL_SIZE", "10")),
            host=os.environ.get("PROJECT_MEMORY_DB_HOST", "localhost"),
            port=int(os.environ.get("PROJECT_MEMORY_DB_PORT", "5432")),
            database=os.environ.get("PROJECT_MEMORY_DB_NAME", "project_memory"),
            user=os.environ.get("PROJECT_MEMORY_DB_USER", "mcp_server"),
            password=os.environ.get("PROJECT_MEMORY_DB_PASSWORD", ""),
        )

    @contextmanager
    def get_connection(self) -> Generator:
        conn = self.connection_pool.getconn()
        try:
            yield conn
            conn.commit()
        except Exception:
            conn.rollback()
            raise
        finally:
            self.connection_pool.putconn(conn)

    def store_decision(self, decision: str, reasoning: str = None, tags: List[str] = None) -> int:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO mcp.decisions (decision, reasoning, tags)
                    VALUES (%s, %s, %s)
                    RETURNING id
                    """,
                    (decision, reasoning, tags or [])
                )
                return cur.fetchone()[0]

    def search_decisions(self, query: str, limit: int = 20) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, decision, reasoning, timestamp, tags,
                           ts_rank(search_vector, plainto_tsquery('english', %s)) as rank
                    FROM mcp.decisions
                    WHERE search_vector @@ plainto_tsquery('english', %s)
                    ORDER BY rank DESC, timestamp DESC
                    LIMIT %s
                    """,
                    (query, query, limit)
                )
                columns = [desc[0] for desc in cur.description]
                return [dict(zip(columns, row)) for row in cur.fetchall()]

    def get_recent_decisions(self, limit: int = 20) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    SELECT id, decision, reasoning, timestamp, tags
                    FROM mcp.decisions
                    ORDER BY timestamp DESC
                    LIMIT %s
                    """,
                    (limit,)
                )
                columns = [desc[0] for desc in cur.description]
                return [dict(zip(columns, row)) for row in cur.fetchall()]

    def store_pattern(self, name: str, description: str, example: str = None) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO mcp.patterns (name, description, example)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (name) DO UPDATE SET
                        description = EXCLUDED.description,
                        example = EXCLUDED.example
                    """,
                    (name, description, example)
                )
                return True

    def get_patterns(self) -> List[Dict[str, Any]]:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT name, description, example FROM mcp.patterns ORDER BY name")
                columns = [desc[0] for desc in cur.description]
                return [dict(zip(columns, row)) for row in cur.fetchall()]

    def set_context(self, key: str, value: str) -> bool:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute(
                    """
                    INSERT INTO mcp.context (key, value, updated_at)
                    VALUES (%s, %s, CURRENT_TIMESTAMP)
                    ON CONFLICT (key) DO UPDATE SET
                        value = EXCLUDED.value,
                        updated_at = CURRENT_TIMESTAMP
                    """,
                    (key, value)
                )
                return True

    def get_context(self, key: str) -> Optional[str]:
        with self.get_connection() as conn:
            with conn.cursor() as cur:
                cur.execute("SELECT value FROM mcp.context WHERE key = %s", (key,))
                row = cur.fetchone()
                return row[0] if row else None

    def close(self):
        self.connection_pool.closeall()
```

## Production Configuration

### Connection Pooling

```python
# Recommended settings by team size
POOL_SETTINGS = {
    "small_team": {"minconn": 2, "maxconn": 10},
    "medium_team": {"minconn": 5, "maxconn": 25},
    "large_team": {"minconn": 10, "maxconn": 50},
}
```

### High Availability

```yaml
# docker-compose.yml for HA deployment
services:
  postgres-primary:
    image: postgres:16
    environment:
      POSTGRES_DB: project_memory
      POSTGRES_USER: mcp_server
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - pg_primary_data:/var/lib/postgresql/data
      - ./init.sql:/docker-entrypoint-initdb.d/init.sql
    command: >
      postgres
      -c wal_level=replica
      -c max_wal_senders=3
      -c max_replication_slots=3

  postgres-replica:
    image: postgres:16
    environment:
      PGUSER: replicator
      PGPASSWORD: ${REPLICATOR_PASSWORD}
    command: >
      bash -c "
        pg_basebackup -h postgres-primary -D /var/lib/postgresql/data -U replicator -Fp -Xs -P -R
        postgres
      "
    depends_on:
      - postgres-primary

  mcp-server:
    build: ./scripts/mcp
    environment:
      PROJECT_MEMORY_DB_TYPE: postgresql
      PROJECT_MEMORY_DB_HOST: postgres-primary
      PROJECT_MEMORY_DB_PORT: 5432
      PROJECT_MEMORY_DB_NAME: project_memory
      PROJECT_MEMORY_DB_USER: mcp_server
      PROJECT_MEMORY_DB_PASSWORD: ${DB_PASSWORD}
      PROJECT_MEMORY_POOL_SIZE: 25
    depends_on:
      - postgres-primary
```

### Backup and Recovery

```bash
#!/bin/bash
# backup.sh - Daily backup script

BACKUP_DIR="/backups/project_memory"
DATE=$(date +%Y%m%d_%H%M%S)

# Full backup
pg_dump -h localhost -U mcp_server -d project_memory \
    -F custom -f "${BACKUP_DIR}/full_${DATE}.dump"

# Keep last 7 days
find "${BACKUP_DIR}" -name "full_*.dump" -mtime +7 -delete

# Point-in-time recovery archive
pg_basebackup -h localhost -U replicator -D "${BACKUP_DIR}/base_${DATE}" \
    -Ft -Xs -P
```

### Monitoring Queries

```sql
-- Active connections
SELECT count(*) as connections,
       state,
       application_name
FROM pg_stat_activity
WHERE datname = 'project_memory'
GROUP BY state, application_name;

-- Table sizes
SELECT relname as table,
       pg_size_pretty(pg_total_relation_size(relid)) as total_size
FROM pg_catalog.pg_statio_user_tables
WHERE schemaname = 'mcp'
ORDER BY pg_total_relation_size(relid) DESC;

-- Decision volume by day
SELECT date_trunc('day', timestamp) as day,
       count(*) as decisions
FROM mcp.decisions
GROUP BY 1
ORDER BY 1 DESC
LIMIT 30;

-- Most searched terms (requires pg_stat_statements)
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%plainto_tsquery%'
ORDER BY calls DESC
LIMIT 20;
```

## Migration from SQLite

```python
#!/usr/bin/env python3
"""Migrate from SQLite to PostgreSQL."""

import sqlite3
import psycopg2
from datetime import datetime

def migrate(sqlite_path: str, pg_connection_string: str):
    """Migrate all data from SQLite to PostgreSQL."""

    sqlite_conn = sqlite3.connect(sqlite_path)
    pg_conn = psycopg2.connect(pg_connection_string)

    try:
        sqlite_cur = sqlite_conn.cursor()
        pg_cur = pg_conn.cursor()

        # Migrate decisions
        sqlite_cur.execute("SELECT decision, reasoning, timestamp, tags FROM decisions")
        for row in sqlite_cur.fetchall():
            decision, reasoning, timestamp, tags = row
            tags_list = tags.split(',') if tags else []
            pg_cur.execute(
                """
                INSERT INTO mcp.decisions (decision, reasoning, timestamp, tags)
                VALUES (%s, %s, %s, %s)
                """,
                (decision, reasoning, timestamp, tags_list)
            )

        # Migrate patterns
        sqlite_cur.execute("SELECT name, description, example FROM patterns")
        for row in sqlite_cur.fetchall():
            pg_cur.execute(
                """
                INSERT INTO mcp.patterns (name, description, example)
                VALUES (%s, %s, %s)
                ON CONFLICT (name) DO NOTHING
                """,
                row
            )

        # Migrate context
        sqlite_cur.execute("SELECT key, value FROM context")
        for row in sqlite_cur.fetchall():
            pg_cur.execute(
                """
                INSERT INTO mcp.context (key, value)
                VALUES (%s, %s)
                ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value
                """,
                row
            )

        pg_conn.commit()
        print(f"Migration complete!")

    finally:
        sqlite_conn.close()
        pg_conn.close()

if __name__ == "__main__":
    import sys
    if len(sys.argv) != 3:
        print("Usage: migrate.py <sqlite_path> <pg_connection_string>")
        sys.exit(1)
    migrate(sys.argv[1], sys.argv[2])
```

## Security Considerations

### Connection Security

```bash
# Enable SSL in PostgreSQL
export PROJECT_MEMORY_DB_SSLMODE=require
export PROJECT_MEMORY_DB_SSLROOTCERT=/path/to/ca.crt
```

### Row-Level Security (Multi-tenant)

```sql
-- Enable RLS for multi-team deployments
ALTER TABLE mcp.decisions ENABLE ROW LEVEL SECURITY;

CREATE POLICY team_isolation ON mcp.decisions
    USING (team_id = current_setting('app.current_team')::int);
```

### Audit Logging

```sql
-- Enable audit logging
CREATE EXTENSION IF NOT EXISTS pgaudit;

-- Log all DML on mcp schema
ALTER SYSTEM SET pgaudit.log = 'write';
ALTER SYSTEM SET pgaudit.log_schema = 'mcp';
SELECT pg_reload_conf();
```

## Related Documentation

- [MCP Security Guide](./MCP-SECURITY.md)
- [Enterprise Deployment](./guides/enterprise.md)
- [Team Memory Federation](./TEAM-MEMORY-FEDERATION.md)

---

_Last Updated: December 2025_
