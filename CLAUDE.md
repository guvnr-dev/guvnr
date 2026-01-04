# Guvnr

## Overview

Universal AI coding assistant configuration — one config governs Claude, Cursor, Copilot, Windsurf, Aider, and 15+ other AI tools. This project dogfoods itself—we use Guvnr to build Guvnr.

**Meta-nature**: Every improvement to Guvnr should be validated by using Guvnr during development. If a pattern doesn't help us build this project, it won't help others.

## Project Purpose

Provide a single source of truth (`guvnr.yaml`) that generates tool-specific configurations for all major AI coding assistants, eliminating the need to maintain separate config files for each tool.

## Tech Stack

- **Primary**: Node.js, JavaScript (ES Modules)
- **CLI Tool**: Commander.js, Enquirer
- **Config Format**: YAML (js-yaml)
- **MCP Server**: Python (SQLite backend)
- **Documentation**: Markdown, VitePress
- **Testing**: Node.js native test runner, pytest, bash

## Architecture

### Core Files

```
guvnr.yaml                          # Single source of truth (abstract config)
├── generates → CLAUDE.md           # Claude Code context
├── generates → .claude/commands/   # Claude slash commands
├── generates → .claude/agents/     # Claude subagents
├── generates → .cursor/rules/      # Cursor IDE rules
├── generates → .github/copilot-instructions.md
├── generates → AGENTS.md           # Linux Foundation standard
└── generates → [other tool configs]

src/
├── commands/
│   ├── init.js                     # Initialize guvnr.yaml
│   ├── generate.js                 # Generate tool configs from guvnr.yaml
│   ├── validate.js                 # Validate configuration
│   ├── doctor.js                   # Environment diagnostics
│   ├── lint.js                     # Configuration linter
│   ├── detect.js                   # Detect installed AI tools
│   ├── update.js                   # Check for updates
│   └── uninstall.js                # Remove guvnr files
├── schemas/
│   ├── guvnr.schema.json           # guvnr.yaml JSON Schema
│   └── claude-md.schema.json       # CLAUDE.md validation
├── index.js                        # Main module exports
└── errors.js                       # Error handling

templates/
├── guvnr.yaml.template             # Base guvnr.yaml template
└── presets/
    ├── minimal/guvnr.yaml          # Minimal preset
    ├── standard/guvnr.yaml         # Standard preset
    ├── full/guvnr.yaml             # Full preset
    └── team/guvnr.yaml             # Team preset
```

### Key Relationships

- guvnr.yaml → (guvnr generate) → Tool-specific configs
- All AI tools are treated equally (no tool is "primary")
- Legacy CLAUDE.md support for migration

## Conventions

### File Naming

- Markdown: `kebab-case.md`
- Scripts: `kebab-case.sh` or `kebab-case.py`
- Config: `guvnr.yaml` (source), `CLAUDE.md` (generated)

### Commit Messages

- `feat:` new capabilities
- `fix:` corrections to existing content
- `docs:` documentation improvements
- `refactor:` restructuring without functional change
- `meta:` changes to the framework development process itself

## Common Commands

```bash
# Initialize guvnr in a project
guvnr init

# Generate tool configs from guvnr.yaml
guvnr generate

# Validate configuration
guvnr validate

# Check environment health
guvnr doctor

# Run tests
npm test

# Run all tests
npm run test:all
```

## Current State

### Phase

Phase 4: Guvnr Rebrand — Transforming to true multi-tool architecture

### Active Work

- Completing rebrand from former package name to "guvnr"
- Implementing guvnr.yaml as single source of truth
- Updating all documentation and tests

### Recent Decisions

- 2025-01-03: Rebrand to "guvnr" (npm name available, guvnr-dev org on GitHub)
- 2025-01-03: guvnr.yaml becomes single source of truth, all tool configs generated
- 2025-01-03: True multi-tool architecture — no AI tool is privileged

### Completed Work

- [x] guvnr.yaml JSON Schema created
- [x] package.json updated with new branding
- [x] CLI branding updated
- [x] init.js rewritten for guvnr.yaml
- [x] generate.js updated to read guvnr.yaml
- [x] validate.js updated for new format
- [x] index.js exports updated
- [x] Preset templates created (minimal, standard, full, team)
- [x] README.md rewritten

### In Progress

- [ ] Update remaining documentation files
- [ ] Update tests for new architecture
- [ ] Update git remote to guvnr-dev org

### Known Gaps

- [ ] Not yet published to npm
- [ ] VitePress site needs hosting at guvnr.dev

## Critical Constraints

1. **Single Source of Truth**: guvnr.yaml defines everything once; tool configs are generated.

2. **Tool Agnostic**: No AI tool is privileged. All are generated equally from guvnr.yaml.

3. **Dogfood Everything**: Every pattern must be used during development.

4. **Copy-Paste Ready**: Generated configs must work without modification.

## Session Instructions

### Before Starting

1. Read this file completely
2. Check `docs/session-notes/` for recent context
3. Run `guvnr validate` to check current state

### During Work

- Use `/plan` before implementing anything significant
- Use `/verify` before marking tasks complete
- Use `/security-review` for security-sensitive code
- Track progress using TodoWrite

### Before Ending

- Run `/handoff` to capture session state
- Update "Current State" section above
- Commit work in progress

### Security Checklist

Before committing, verify:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation present where needed
- [ ] Dependencies exist (not hallucinated names)
- [ ] Error handling doesn't expose internal details

---

_Guvnr: One config to govern them all._
