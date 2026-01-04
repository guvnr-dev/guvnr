# Agent Skills Templates

This directory contains pre-built SKILL.md templates that follow the [Agent Skills specification](https://agentskills.io/specification).

## What Are Skills?

Skills are structured, auto-discovered capabilities that AI agents (Copilot, Codex, Claude Code) can activate when relevant. They provide:

- **Consistent behavior** across users and sessions
- **Reusable workflows** for common tasks
- **Progressive disclosure** - only loaded when needed
- **Cross-platform compatibility** - works across multiple AI tools

## Available Skills

| Skill                                             | Description                      | Use Case               |
| ------------------------------------------------- | -------------------------------- | ---------------------- |
| [project-standards](./project-standards/SKILL.md) | Coding standards and conventions | Writing/reviewing code |
| [security-review](./security-review/SKILL.md)     | OWASP and AI-specific security   | Security audits        |
| [test-driven](./test-driven/SKILL.md)             | TDD practices and patterns       | Implementing features  |

## Installation

### GitHub Copilot

Copy to `.github/skills/`:

```bash
cp -r templates/skills/* .github/skills/
```

### OpenAI Codex

Copy to `.codex/skills/`:

```bash
cp -r templates/skills/* .codex/skills/
```

### Claude Code

Copy to `.claude/skills/`:

```bash
cp -r templates/skills/* .claude/skills/
```

### Via Framework CLI

```bash
npx guvnr generate --tools skills
```

## SKILL.md Format

Skills follow this structure:

```yaml
---
name: skill-name
description: When to use this skill (max 1024 chars)
allowed-tools: Read, Grep, Glob  # Optional: limit available tools
---

# Skill Name

[Markdown instructions for the agent]

## When to Use

[Conditions that trigger this skill]

## Guidelines

[Specific instructions and patterns]
```

## Best Practices

### Keep Skills Focused

Each skill should do one thing well:

```yaml
# Good
name: security-review
description: Perform security-focused code review

# Bad
name: everything
description: Handle all coding tasks
```

### Use Progressive Disclosure

Keep SKILL.md under 500 lines. Split into separate files if needed:

```
my-skill/
├── SKILL.md           # Core instructions
├── references/        # Extended documentation
│   └── patterns.md
└── scripts/           # Helper scripts
    └── validate.sh
```

### Write Clear Descriptions

The description is used by agents to decide when to activate:

```yaml
# Good - specific and actionable
description: Perform security-focused code review using OWASP guidelines and AI-specific security best practices

# Bad - vague
description: Help with security stuff
```

## Cross-Platform Compatibility

### GitHub Copilot Auto-Discovery

As of December 2025, **GitHub Copilot automatically discovers skills** from multiple locations:

1. `.github/skills/` (native Copilot location)
2. `.claude/skills/` (Claude Code skills)
3. `.codex/skills/` (OpenAI Codex skills)

This means you can place skills in any of these directories and Copilot will find them. For maximum compatibility, we recommend:

```bash
# Generate skills to .github/skills/ for Copilot compatibility
npx guvnr generate --tools skills
```

### Compatibility Matrix

| Skill Location    | Copilot           | Codex     | Claude Code |
| ----------------- | ----------------- | --------- | ----------- |
| `.github/skills/` | ✅ Native         | ✅ Reads  | ✅ Reads    |
| `.claude/skills/` | ✅ Auto-discovers | ✅ Reads  | ✅ Native   |
| `.codex/skills/`  | ✅ Auto-discovers | ✅ Native | ✅ Reads    |

### AAIF Standardization

Skills are now part of the [AAIF (Agentic AI Foundation)](https://aaif.io) ecosystem, ensuring cross-platform compatibility as more tools adopt the standard.

## Creating Custom Skills

1. Create a new directory: `skills/my-skill/`
2. Add `SKILL.md` with frontmatter
3. Write clear instructions
4. Test with your AI tool
5. Iterate based on behavior

## Resources

- [Agent Skills Specification](https://agentskills.io/specification)
- [OpenAI Skills Documentation](https://developers.openai.com/codex/skills/)
- [GitHub Copilot Skills](https://docs.github.com/en/copilot/concepts/agents/about-agent-skills)
- [Claude Skills Documentation](https://code.claude.com/docs/en/skills)

---

_Part of [Guvnr](https://github.com/guvnr-dev/guvnr)_
