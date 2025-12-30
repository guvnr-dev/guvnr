# Getting Started

Get up and running with the AI Excellence Framework in under 5 minutes.

## TL;DR — 30-Second Setup

```bash
# One command to install everything
npx ai-excellence-framework init --preset standard

# Start using immediately
/plan add a login button to the header
```

That's it. You now have structured AI assistance for your project.

---

## Why Use This Framework?

AI coding assistants are powerful but have known friction points:

| Problem | Without Framework | With Framework |
| --- | --- | --- |
| AI forgets project context | Repeats questions every session | Reads CLAUDE.md automatically |
| Incomplete implementations | "Done" but half-finished | `/verify` catches gaps |
| Security vulnerabilities | 86% of AI code has XSS issues | `/security-review` audits code |
| Lost session context | Start from scratch next time | `/handoff` preserves state |
| Hallucinated packages | 20% fake dependencies | Pre-commit hooks catch them |

**The framework provides structure that makes AI assistance reliable.**

---

## Prerequisites

- **Node.js** 18.0.0 or higher
- **Git** (for version control features)
- **An AI coding assistant** (Claude Code, Cursor, Copilot, etc.)

Check your setup:

```bash
node --version  # Should be v18.0.0 or higher
git --version   # Any recent version
```

---

## Installation Options

### Option 1: Interactive Setup (Recommended)

```bash
cd your-project
npx ai-excellence-framework init
```

You'll be guided through choosing a preset and customizing options.

### Option 2: Preset Selection

| Preset | Best For | Install Command |
| --- | --- | --- |
| **Minimal** | Trying it out | `npx ai-excellence-framework init --preset minimal` |
| **Standard** | Individual devs | `npx ai-excellence-framework init --preset standard` |
| **Full** | Serious projects | `npx ai-excellence-framework init --preset full` |
| **Team** | Team collaboration | `npx ai-excellence-framework init --preset team` |

### Option 3: Global Installation

```bash
npm install -g ai-excellence-framework
ai-excellence init  # or: aix init
```

---

## Your First 10 Minutes

### Minute 1-2: Verify Installation

```bash
npx ai-excellence-framework doctor
```

You should see green checkmarks:

```
  Environment:
    ✓ Node.js version: v20.10.0
    ✓ Git available: 2.43.0

  Framework:
    ✓ Framework installed: Yes
    ✓ CLAUDE.md present: Yes

  Summary: 10/10 checks passed

  ✓ All systems operational!
```

### Minute 3-5: Customize CLAUDE.md

Open `CLAUDE.md` and fill in your project details:

```markdown
# My Project Name

## Overview

A brief description of what this project does.

## Tech Stack

- Frontend: React 18 with TypeScript
- Backend: Node.js with Express
- Database: PostgreSQL

## Architecture

src/
├── components/   # React components
├── api/          # API routes
└── utils/        # Helper functions

## Current State

### Phase
Early development - building core features

### Recent Decisions
- 2025-01-15: Chose React Query for data fetching
```

### Minute 6-7: Try Your First Command

Open your AI assistant and try:

```
/plan add a dark mode toggle to the settings page
```

The AI will create a structured plan before coding.

### Minute 8-9: Verify Work

After the AI implements something:

```
/verify check the dark mode implementation is complete
```

This catches incomplete work before you accept it.

### Minute 10: End Your Session

```
/handoff
```

This creates a summary for your next session.

---

## The Core Workflow

```
┌─────────────────────────────────────────────────────────┐
│                    AI SESSION                           │
│                                                         │
│  START ───────┬──────────────┬──────────────┬─── END   │
│               │              │              │           │
│           /plan          implement      /verify         │
│               │              │              │           │
│        ┌──────▼──────┐   ┌──▼──┐    ┌──────▼──────┐   │
│        │ Structured  │   │ AI  │    │ Skeptical   │   │
│        │ planning    │   │works│    │ validation  │   │
│        └─────────────┘   └─────┘    └─────────────┘   │
│               │              │              │           │
│               └──────────────┴──────────────┘           │
│                          │                              │
│                     /handoff                            │
│                          │                              │
│                  ┌───────▼───────┐                     │
│                  │ Session notes │                     │
│                  │ for next time │                     │
│                  └───────────────┘                     │
└─────────────────────────────────────────────────────────┘
```

---

## Available Commands

### Essential (Use Daily)

| Command | Purpose | When to Use |
| --- | --- | --- |
| `/plan [task]` | Create implementation plan | Before any significant work |
| `/verify [task]` | Check work is complete | Before accepting AI output |
| `/handoff` | Generate session summary | End of each session |

### Situational (As Needed)

| Command | Purpose | When to Use |
| --- | --- | --- |
| `/assumptions [task]` | Surface hidden assumptions | When requirements are unclear |
| `/review [path]` | Multi-perspective code review | After significant changes |
| `/security-review [path]` | Security audit | For security-sensitive code |
| `/refactor [target]` | Plan safe refactoring | Before restructuring code |
| `/test-coverage [path]` | Analyze test gaps | When improving tests |

---

## Common Scenarios

### Scenario: Bug Fix

```bash
# 1. Plan the fix
/plan fix the login button not responding on mobile

# 2. AI investigates and fixes

# 3. Verify the fix
/verify check the mobile login fix

# 4. Commit
git add . && git commit -m "fix: mobile login button responsiveness"
```

### Scenario: New Feature

```bash
# 1. Plan the feature
/plan add user profile page with avatar upload

# 2. Surface assumptions first
/assumptions user profile requirements

# 3. AI implements

# 4. Security review (user-facing features)
/security-review src/components/Profile.tsx

# 5. Verify
/verify check profile page implementation

# 6. Commit
git add . && git commit -m "feat: add user profile page"
```

### Scenario: Code Review

```bash
# Get a thorough review
/review src/api/auth.ts

# Or focus on security
/security-review src/api/auth.ts
```

### Scenario: Refactoring

```bash
# Plan the refactor first
/refactor extract payment logic into separate module

# AI creates safe refactoring plan
# Then implements step by step
```

---

## What Gets Installed

After running `init`, your project contains:

```
your-project/
├── CLAUDE.md                    # Project context (edit this!)
├── .claude/
│   ├── commands/
│   │   ├── plan.md             # /plan command
│   │   ├── verify.md           # /verify command
│   │   ├── handoff.md          # /handoff command
│   │   ├── assumptions.md      # /assumptions command
│   │   ├── review.md           # /review command
│   │   ├── security-review.md  # /security-review command
│   │   ├── refactor.md         # /refactor command
│   │   └── test-coverage.md    # /test-coverage command
│   └── agents/
│       ├── explorer.md         # Codebase exploration
│       ├── reviewer.md         # Code review
│       └── tester.md           # Test generation
├── scripts/
│   ├── hooks/                   # Git hooks (standard/full/team)
│   └── mcp/                     # MCP server (full/team only)
├── docs/
│   └── session-notes/          # Session handoff notes
└── .tmp/                        # Temporary files (gitignored)
```

---

## Multi-Tool Support

The framework works with 10+ AI coding assistants:

| Tool | Configuration File |
| --- | --- |
| Claude Code | `CLAUDE.md` |
| Cursor | `.cursor/rules/` |
| GitHub Copilot | `.github/copilot-instructions.md` |
| Windsurf | `.windsurf/rules/` |
| Aider | `.aider.conf.yml` |
| Gemini CLI | `GEMINI.md` |
| OpenAI Codex | `.codex/` |
| Zed | `.rules` |
| Sourcegraph Amp | `amp.toml` |
| Roo Code | `.roo/rules/` |

Generate configs for your tools:

```bash
# Generate for specific tool
npx ai-excellence-framework generate cursor

# Generate for multiple tools
npx ai-excellence-framework generate cursor copilot aider

# Generate for all supported tools
npx ai-excellence-framework generate all
```

---

## Optional Enhancements

### Enable Pre-commit Hooks

Security scanning on every commit:

```bash
pip install pre-commit
pre-commit install
```

### Enable MCP Server (Full/Team Presets)

Persist decisions across sessions:

```bash
pip install mcp
python scripts/mcp/project-memory-server.py
```

### Validate Configuration

Check your setup anytime:

```bash
npx ai-excellence-framework validate

# Fix issues automatically
npx ai-excellence-framework validate --fix
```

---

## Troubleshooting

### "Command not found" errors

```bash
# Use npx
npx ai-excellence-framework --help

# Or install globally
npm install -g ai-excellence-framework
```

### Slash commands not working

1. Check files exist: `ls .claude/commands/`
2. Verify YAML frontmatter is valid
3. Restart your AI assistant

### CLAUDE.md not being read

1. File must be named exactly `CLAUDE.md` (case-sensitive)
2. Must be in project root
3. Must be valid markdown

### Doctor command shows errors

```bash
# See detailed diagnostics
npx ai-excellence-framework doctor --verbose

# Auto-fix common issues
npx ai-excellence-framework doctor --fix
```

See [Troubleshooting Guide](/TROUBLESHOOTING) for more solutions.

---

## Next Steps

1. **Customize CLAUDE.md** — Add your project's specific context
2. **Try /plan** — Plan your first feature
3. **Use /verify** — Verify AI-completed work
4. **Read [Quick Reference](/QUICK-REFERENCE)** — One-page command summary
5. **Explore [Model Selection](/MODEL-SELECTION)** — Choose the right AI model
6. **Read [When AI Helps](/WHEN-AI-HELPS)** — Maximize AI effectiveness

---

## Getting Help

- **Quick Reference**: [One-page guide](/QUICK-REFERENCE)
- **Troubleshooting**: [Common issues](/TROUBLESHOOTING)
- **GitHub Issues**: [Report bugs](https://github.com/ai-excellence-framework/ai-excellence-framework/issues)
- **Discussions**: [Ask questions](https://github.com/ai-excellence-framework/ai-excellence-framework/discussions)

---

Ready to dive deeper? Check out [Core Concepts](/docs/concepts) to understand the framework's philosophy.
