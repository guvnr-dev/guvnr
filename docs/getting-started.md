# Getting Started

Get up and running with Guvnr in under 5 minutes.

## TL;DR — 30-Second Setup

```bash
# Initialize guvnr
npx guvnr init --preset standard

# Generate configs for your AI tools
npx guvnr generate

# Start using immediately
/plan add a login button to the header
```

That's it. You now have unified AI configuration for your project.

---

## Why Use Guvnr?

**The Problem**: Every AI tool has its own config format. Keeping them in sync is tedious.

**The Solution**: Write once in `guvnr.yaml`, generate everywhere.

| AI Tool         | Config Format                     | Guvnr Generates |
| --------------- | --------------------------------- | --------------- |
| Claude Code     | `CLAUDE.md`, `.claude/`           | ✅              |
| Cursor          | `.cursor/rules/`                  | ✅              |
| GitHub Copilot  | `.github/copilot-instructions.md` | ✅              |
| Windsurf        | `.windsurf/rules/`                | ✅              |
| Aider           | `.aider.conf.yml`                 | ✅              |
| 20+ more...     | Various                           | ✅              |

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

## Installation

### Option 1: Interactive Setup (Recommended)

```bash
cd your-project
npx guvnr init
```

You'll be guided through choosing a preset and customizing options.

### Option 2: Preset Selection

| Preset       | Best For           | Install Command                  |
| ------------ | ------------------ | -------------------------------- |
| **Minimal**  | Trying it out      | `npx guvnr init --preset minimal`  |
| **Standard** | Individual devs    | `npx guvnr init --preset standard` |
| **Full**     | Serious projects   | `npx guvnr init --preset full`     |
| **Team**     | Team collaboration | `npx guvnr init --preset team`     |

### Option 3: Global Installation

```bash
npm install -g guvnr
guvnr init
```

---

## Your First 10 Minutes

### Minute 1-2: Verify Installation

```bash
npx guvnr doctor
```

You should see green checkmarks:

```
  Environment:
    ✓ Node.js version: v20.10.0
    ✓ Git available: 2.43.0

  Framework:
    ✓ guvnr.yaml present: Yes
    ✓ Configuration valid: Yes

  Summary: 10/10 checks passed

  ✓ All systems operational!
```

### Minute 3-5: Customize guvnr.yaml

Open `guvnr.yaml` and fill in your project details:

```yaml
version: "1.0"

project:
  name: "My App"
  description: "A brief description of what this project does"

tech_stack:
  primary_language: "TypeScript"
  framework: "React 18"
  database: "PostgreSQL"

context:
  overview: |
    Describe your project here.

conventions:
  code_style:
    - "Use TypeScript strict mode"
    - "Prefer functional components"
  commit_messages: "conventional"

tools:
  claude:
    generate: true
  cursor:
    generate: true
  copilot:
    generate: true
```

### Minute 6-7: Generate Tool Configs

```bash
npx guvnr generate
```

This creates all your tool-specific config files from guvnr.yaml.

### Minute 8-9: Try Your First Command

Open your AI assistant and try:

```
/plan add a dark mode toggle to the settings page
```

The AI will create a structured plan before coding.

### Minute 10: Verify Work

After the AI implements something:

```
/verify check the dark mode implementation is complete
```

This catches incomplete work before you accept it.

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

## Available Skills (Slash Commands)

### Essential (Use Daily)

| Skill            | Purpose                    | When to Use                 |
| ---------------- | -------------------------- | --------------------------- |
| `/plan [task]`   | Create implementation plan | Before any significant work |
| `/verify [task]` | Check work is complete     | Before accepting AI output  |
| `/handoff`       | Generate session summary   | End of each session         |

### Situational (As Needed)

| Skill                     | Purpose                       | When to Use                   |
| ------------------------- | ----------------------------- | ----------------------------- |
| `/assumptions [task]`     | Surface hidden assumptions    | When requirements are unclear |
| `/review [path]`          | Multi-perspective code review | After significant changes     |
| `/security-review [path]` | Security audit                | For security-sensitive code   |
| `/refactor [target]`      | Plan safe refactoring         | Before restructuring code     |
| `/test-coverage [path]`   | Analyze test gaps             | When improving tests          |

---

## CLI Commands

```bash
guvnr init [--preset <name>]    # Initialize guvnr.yaml
guvnr generate [--tools <list>] # Generate tool configs
guvnr validate                  # Validate configuration
guvnr doctor                    # Check environment health
guvnr lint                      # Lint configuration files
guvnr detect                    # Detect installed AI tools
guvnr update                    # Check for updates
```

---

## What Gets Generated

After running `guvnr generate`, your project contains:

```
your-project/
├── guvnr.yaml                  # Your config (source of truth)
├── CLAUDE.md                   # Generated for Claude Code
├── .claude/
│   ├── commands/
│   │   ├── plan.md             # /plan skill
│   │   ├── verify.md           # /verify skill
│   │   └── ...                 # Other skills
│   └── agents/
│       ├── explorer.md         # Codebase exploration
│       ├── reviewer.md         # Code review
│       └── tester.md           # Test generation
├── .cursor/rules/              # Generated for Cursor
├── .github/
│   └── copilot-instructions.md # Generated for Copilot
├── AGENTS.md                   # Generated AGENTS.md standard
└── ...                         # Other tool configs
```

---

## Regenerating After Changes

When you update `guvnr.yaml`:

```bash
guvnr generate
```

All tool configs are regenerated to stay in sync.

---

## Troubleshooting

### "Command not found" errors

```bash
# Use npx
npx guvnr --help

# Or install globally
npm install -g guvnr
```

### Slash commands not working

1. Check files exist: `ls .claude/commands/`
2. Run `guvnr generate` to regenerate
3. Restart your AI assistant

### Validation errors

```bash
# See detailed diagnostics
npx guvnr doctor --verbose

# Validate configuration
npx guvnr validate
```

See [Troubleshooting Guide](/TROUBLESHOOTING) for more solutions.

---

## Next Steps

1. **Customize guvnr.yaml** — Add your project's specific context
2. **Run `guvnr generate`** — Create tool configs
3. **Try /plan** — Plan your first feature
4. **Use /verify** — Verify AI-completed work
5. **Read [Quick Reference](/QUICK-REFERENCE)** — One-page command summary

---

## Getting Help

- **Quick Reference**: [One-page guide](/QUICK-REFERENCE)
- **Troubleshooting**: [Common issues](/TROUBLESHOOTING)
- **GitHub Issues**: [Report bugs](https://github.com/guvnr-dev/guvnr/issues)
- **Discussions**: [Ask questions](https://github.com/guvnr-dev/guvnr/discussions)

---

Ready to dive deeper? Check out [Core Concepts](/docs/concepts) to understand Guvnr's philosophy.
