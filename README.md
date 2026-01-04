# Guvnr

**One config to govern Claude, Cursor, Copilot, Windsurf, Aider, and 15+ other AI coding tools.**

[![npm version](https://img.shields.io/npm/v/guvnr)](https://www.npmjs.com/package/guvnr)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![AGENTS.md](https://img.shields.io/badge/AGENTS.md-compatible-blue)](https://agents.md)
[![OpenSSF](https://img.shields.io/badge/OpenSSF-aligned-green)](https://best.openssf.org)

## The Problem

Every AI coding tool has its own configuration format:
- Claude uses `CLAUDE.md`
- Cursor uses `.cursor/rules/`
- Copilot uses `.github/copilot-instructions.md`
- Windsurf uses `.windsurf/rules/`
- Aider uses `.aider.conf.yml`

Maintaining consistent AI behavior across tools is tedious and error-prone.

## The Solution

**Write once, generate everywhere.**

Define your project context in a single `guvnr.yaml` file. Guvnr generates tool-specific configurations for all your AI assistants.

```yaml
# guvnr.yaml - Your single source of truth
version: "1.0"

project:
  name: "My App"
  description: "SaaS platform for widget management"

tech_stack:
  primary_language: "TypeScript"
  framework: "Next.js 14"
  database: "PostgreSQL"

conventions:
  code_style:
    - "Use TypeScript strict mode"
    - "Prefer functional components"
  commit_messages: "conventional"

skills:
  plan:
    description: "Create implementation plan before coding"
  verify:
    description: "Verify task completion"
  security-review:
    description: "OWASP-aligned security review"

tools:
  claude:
    generate: true
  cursor:
    generate: true
  copilot:
    generate: true
```

Then run:

```bash
guvnr generate
```

This creates:
- `CLAUDE.md` — Claude Code context file
- `.claude/commands/` — Claude slash commands
- `.cursor/rules/` — Cursor IDE rules
- `.github/copilot-instructions.md` — GitHub Copilot instructions
- `AGENTS.md` — [Linux Foundation standard](https://agents.md) (60K+ projects)

## Quick Start

```bash
# Install and initialize
npx guvnr init

# Or with a specific preset
npx guvnr init --preset standard

# Generate tool configs
npx guvnr generate

# Validate your setup
npx guvnr validate
```

### Available Presets

| Preset | Description |
|--------|-------------|
| `minimal` | guvnr.yaml + essential skills only |
| `standard` | Recommended setup for individual developers |
| `full` | Complete setup with MCP server and metrics |
| `team` | Full setup with team collaboration features |

## What Gets Generated

From a single `guvnr.yaml`, generate configs for:

| Tool | Output | Docs |
|------|--------|------|
| Claude Code | `CLAUDE.md`, `.claude/commands/`, `.claude/agents/` | [docs](https://claude.ai) |
| Cursor | `.cursor/rules/` | [docs](https://docs.cursor.com) |
| GitHub Copilot | `.github/copilot-instructions.md` | [docs](https://docs.github.com/copilot) |
| Windsurf | `.windsurf/rules/` | [docs](https://docs.windsurf.com) |
| Aider | `.aider.conf.yml` | [docs](https://aider.chat) |
| AGENTS.md | `AGENTS.md` | [agents.md](https://agents.md) |
| Cline | `.cline/` | [docs](https://cline.dev) |
| Continue | `.continue/` | [docs](https://continue.dev) |
| Zed | `.zed/` | [docs](https://zed.dev) |

## Commands

### Skills (Slash Commands)

Define reusable workflows in `guvnr.yaml`:

```yaml
skills:
  plan:
    description: "Create implementation plan before coding"
  verify:
    description: "Verify task completion with skeptical review"
  security-review:
    description: "OWASP-aligned security review"
```

These become:
- Claude: `.claude/commands/plan.md`, etc.
- Cursor: Rules in `.cursor/rules/`
- Other tools: Appropriate format

### Agents

Define custom subagents:

```yaml
agents:
  reviewer:
    description: "Independent code review agent"
  explorer:
    description: "Codebase exploration agent"
```

## CLI Reference

```bash
guvnr init [--preset <name>]    # Initialize guvnr in project
guvnr generate [--tools <list>] # Generate tool configs from guvnr.yaml
guvnr validate                  # Validate guvnr.yaml and generated files
guvnr doctor                    # Check environment health
guvnr lint                      # Lint configuration files
guvnr update                    # Check for updates
guvnr detect                    # Detect installed AI tools
```

## Security Features

- **Secrets Detection** — Scans for API keys, tokens, credentials
- **Slopsquatting Prevention** — Validates dependencies aren't hallucinated
- **OWASP Alignment** — Security reviews follow OWASP Top 10
- **Pre-commit Hooks** — Optional integration with pre-commit framework

## Configuration Schema

The full `guvnr.yaml` schema supports:

```yaml
version: "1.0"

project:
  name: string
  description: string
  team_size: number  # Optional

tech_stack:
  primary_language: string
  runtime: string
  framework: string
  database: string
  key_dependencies: string[]

context:
  overview: string
  architecture: string
  key_relationships: string[]

conventions:
  code_style: string[]
  commit_messages: string
  file_naming: string

current_state:
  phase: string
  active_work: string[]
  recent_decisions: string[]
  known_issues: string[]

skills:
  <name>:
    description: string
    template: string  # Optional custom template

agents:
  <name>:
    description: string

tools:
  claude: { generate: boolean }
  cursor: { generate: boolean }
  copilot: { generate: boolean }
  windsurf: { generate: boolean }
  aider: { generate: boolean }
  # ... more tools

hooks:
  enabled: boolean
  post_edit: { enabled: boolean, timeout: number }
  verify_deps: { enabled: boolean }

security:
  pre_commit: boolean
  secrets_detection: boolean
  dependency_scanning: boolean

memory:
  enabled: boolean
  storage: "sqlite" | "json"
```

## Philosophy

1. **Single Source of Truth** — `guvnr.yaml` defines everything once
2. **Tool Agnostic** — No AI tool is privileged; all are generated equally
3. **Evidence-Based** — Features are validated through real-world use
4. **Copy-Paste Ready** — Generated configs work without modification
5. **Dogfooding** — We use Guvnr to develop Guvnr

## Migrating from CLAUDE.md

If you have an existing `CLAUDE.md`, Guvnr can detect and import it:

```bash
guvnr init  # Detects existing CLAUDE.md and offers migration
```

## Contributing

Guvnr improves through use. Open an issue or PR if you find:
- A tool that should be supported
- A configuration pattern that works better
- A feature that should be added

## Links

- [Documentation](https://guvnr.dev/docs)
- [GitHub](https://github.com/guvnr-dev/guvnr)
- [npm](https://www.npmjs.com/package/guvnr)

## License

MIT

---

_Guvnr: One config to govern them all._
