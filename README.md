# AI Excellence Framework

**Universal framework for AI-assisted development — works with Claude, Cursor, Copilot, Windsurf, and Aider.**

[![npm version](https://img.shields.io/npm/v/ai-excellence-framework)](https://www.npmjs.com/package/ai-excellence-framework)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AGENTS.md](https://img.shields.io/badge/AGENTS.md-compatible-blue)](https://agents.md)
[![OpenSSF](https://img.shields.io/badge/OpenSSF-aligned-green)](https://best.openssf.org)

## The Problem

AI coding assistants are powerful but constrained. They forget everything between sessions. They can't tell when they're guessing. They lock into first interpretations. They generate fluently regardless of correctness.

These aren't bugs—they're architectural realities. But they create friction that slows development and causes errors.

## The Solution

This framework provides:

1. **Friction Taxonomy** — 59 documented friction points across 17 categories
2. **Mitigation Strategies** — 40+ evidence-based approaches with research citations
3. **Multi-Tool Support** — Works with Claude, Cursor, Copilot, Windsurf, and Aider
4. **Security Focus** — OpenSSF/OWASP-aligned security scanning (slopsquatting, secrets, LLM Top 10)
5. **Industry Standards** — Full [AGENTS.md](https://agents.md) support (60K+ projects)

## Quick Start

### Option 1: CLI Installer (Recommended)

```bash
# Initialize in your project
npx ai-excellence-framework init

# Or with specific preset
npx ai-excellence-framework init --preset full

# Check installation health
npx ai-excellence-framework doctor
```

### Option 2: degit (No Dependencies)

```bash
# Clone a preset template directly
npx degit ai-excellence-framework/templates/presets/standard .

# Available presets: minimal, standard, full, team
```

### Option 3: Manual Copy

```bash
# Copy the framework to your project
cp -r .claude/ your-project/.claude/
cp CLAUDE.md your-project/

# Install pre-commit hooks (optional)
pip install pre-commit
pre-commit install
```

### After Installation

```bash
# Start using Claude Code with the framework
claude  # In your project directory
/plan implement user authentication
```

### Generate Multi-Tool Support

```bash
# Generate configuration for all supported AI tools
npx ai-excellence-framework generate --tools all

# Or specific tools
npx ai-excellence-framework generate --tools cursor,copilot,agents

# Validate your configuration
npx ai-excellence-framework lint
```

This creates:

- `AGENTS.md` — [Linux Foundation standard](https://agents.md) (60K+ projects)
- `.cursor/rules/` — [Cursor IDE rules](https://docs.cursor.com/context/rules)
- `.github/copilot-instructions.md` — [GitHub Copilot instructions](https://docs.github.com/copilot)
- `.windsurf/rules/` — [Windsurf IDE rules](https://docs.windsurf.com)
- `.aider.conf.yml` — [Aider configuration](https://aider.chat)

## What's Included

```
.claude/
├── commands/                     # Slash commands
│   ├── plan.md                   # Plan before implementing
│   ├── verify.md                 # Verify completion skeptically
│   ├── handoff.md                # Generate session summaries
│   ├── assumptions.md            # Surface hidden assumptions
│   ├── review.md                 # Multi-perspective code review
│   ├── security-review.md        # OWASP-aligned security review
│   ├── refactor.md               # Safe refactoring protocol
│   └── test-coverage.md          # Test coverage analysis
├── agents/                       # Custom subagents
│   ├── reviewer.md               # Independent code reviewer
│   ├── explorer.md               # Codebase exploration
│   └── tester.md                 # Test generation
scripts/
├── hooks/
│   ├── post-edit.sh              # Auto-format after edits
│   ├── verify-deps.sh            # Slopsquatting prevention
│   ├── check-todos.sh            # Critical TODO detection
│   └── check-claude-md.sh        # CLAUDE.md validation
├── mcp/
│   └── project-memory-server.py  # Production MCP server (SQLite)
├── metrics/
│   └── collect-session-metrics.sh # Baseline & ongoing measurement
src/
├── commands/                     # CLI implementation
│   ├── init.js                   # Framework installer
│   ├── validate.js               # Configuration validator
│   ├── doctor.js                 # Environment diagnostics
│   ├── update.js                 # Update checker
│   ├── generate.js               # Multi-tool configuration generator
│   └── lint.js                   # Configuration linter
├── schemas/                      # Validation schemas
│   ├── config.schema.json        # Configuration schema
│   └── claude-md.schema.json     # CLAUDE.md validation
templates/
├── presets/                      # Ready-to-use presets
│   ├── minimal/                  # Basic setup
│   ├── standard/                 # Recommended setup
│   ├── full/                     # Complete setup
│   └── team/                     # Team collaboration
├── .pre-commit-config.yaml       # Security + quality hooks
└── CLAUDE.md.template            # Project context template
docs/
└── QUICK-REFERENCE.md            # One-page quick start
tests/
├── cli.test.js                   # CLI tests
├── scripts.test.sh               # Shell script tests
└── mcp/test_project_memory_server.py  # MCP server tests
```

## Core Documents

| Document                                                       | Purpose                                      |
| -------------------------------------------------------------- | -------------------------------------------- |
| [ai-development-friction.md](ai-development-friction.md)       | 59 friction points from the AI's perspective |
| [ai-friction-mitigations.md](ai-friction-mitigations.md)       | 40+ evidence-based mitigation strategies     |
| [ai-friction-implementation.md](ai-friction-implementation.md) | Implementation blueprints and code           |
| [ai-friction-action-plan.md](ai-friction-action-plan.md)       | Strategic roadmap for adoption               |

## Key Commands

### `/plan` — Think Before Coding

Forces structured planning before implementation. Surfaces assumptions, identifies risks, defines completion criteria.

```
/plan add dark mode support
```

### `/verify` — Skeptical Completion Check

Adopts a validator mindset. Attempts to prove work is NOT complete before confirming.

```
/verify the authentication implementation
```

### `/handoff` — Session Continuity

Generates comprehensive session summary for the next session to pick up seamlessly.

```
/handoff
```

### `/assumptions` — Surface the Hidden

Explicitly documents assumptions before they become problems.

```
/assumptions migrating to PostgreSQL
```

### `/security-review` — AI-Specific Security Audit

OWASP-aligned security review specifically tuned for AI-generated code vulnerabilities.

```
/security-review src/auth/
```

Checks for:

- OWASP Top 10 vulnerabilities
- XSS (86% of AI code fails)
- Log injection (88% vulnerable)
- Privilege escalation (322% more common in AI code)
- Hallucinated dependencies (slopsquatting)

## The CLAUDE.md Pattern

The framework centers on `CLAUDE.md` — a persistent context file that loads automatically every session:

```markdown
# Project: MyApp

## Overview

[What this project does]

## Architecture

[Key patterns and structure]

## Conventions

[Coding standards and practices]

## Current State

[What's in progress, recent decisions]

## Session Instructions

[How to work effectively in this codebase]
```

This solves the #1 friction point: session boundary context loss.

## Dogfooding

This framework is developed using itself. Every pattern must prove useful during development of the framework, or it gets removed.

## Philosophy

1. **Friction is real, not excuses** — These constraints exist. Naming them helps navigate them.

2. **Evidence over theory** — Strategies are research-backed and validated through use.

3. **Simple over clever** — If a pattern isn't used, it's removed.

4. **Copy-paste ready** — Everything should work when literally copied into a project.

## Contributing

This framework improves through use. If you find:

- A friction point not documented
- A mitigation that works better
- A pattern that should be removed

Open an issue or PR.

## License

MIT

---

_Built by observing what actually helps in AI-assisted development, not what theoretically should._
