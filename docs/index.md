---
layout: home

hero:
  name: Guvnr
  text: One Config to Rule Them All
  tagline: Universal AI coding assistant configuration — one file governs Claude, Cursor, Copilot, Windsurf, Aider, and 15+ more
  image:
    src: /logo.svg
    alt: Guvnr
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/guvnr-dev/guvnr

features:
  - icon: 📝
    title: Single Source of Truth
    details: Define your project context once in guvnr.yaml. Generate configs for every AI tool automatically.
  - icon: 🔧
    title: 25+ Tools Supported
    details: Claude, Cursor, Copilot, Windsurf, Aider, Cline, Continue, Zed, and more. Add new tools without rewriting configs.
  - icon: 🔒
    title: Security-First
    details: Address the 45% vulnerability rate in AI-generated code with OWASP-aligned reviews and slopsquatting prevention.
  - icon: ⚡
    title: Copy-Paste Ready
    details: Every generated config works immediately. No "adapt to your needs" hand-waving.
  - icon: 🧠
    title: Persistent Memory
    details: MCP server with SQLite storage preserves decisions, patterns, and context across sessions.
  - icon: 📋
    title: Structured Workflows
    details: 8 skills (slash commands) for planning, verification, handoffs, security reviews, and more.
---

## The Problem

Every AI coding tool has its own config format:

- Claude uses `CLAUDE.md`
- Cursor uses `.cursor/rules/`
- Copilot uses `.github/copilot-instructions.md`
- Windsurf uses `.windsurf/rules/`
- Aider uses `.aider.conf.yml`

Keeping them all in sync is tedious and error-prone.

## The Solution

**Write once, generate everywhere.**

```yaml
# guvnr.yaml - Your single source of truth
version: "1.0"

project:
  name: "My App"
  description: "SaaS platform"

tech_stack:
  primary_language: "TypeScript"
  framework: "Next.js 14"

conventions:
  code_style:
    - "Use TypeScript strict mode"
  commit_messages: "conventional"

skills:
  plan:
    description: "Create implementation plan before coding"
  verify:
    description: "Verify task completion"

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
- `CLAUDE.md` + `.claude/commands/` + `.claude/agents/`
- `.cursor/rules/`
- `.github/copilot-instructions.md`
- `AGENTS.md`
- And more...

## Quick Start

```bash
# Install and initialize
npx guvnr init

# Choose your preset
? Select a configuration preset:
  > Standard - Recommended for individual developers
    Minimal - guvnr.yaml + essential skills only
    Full - Complete setup with MCP server and metrics
    Team - Full setup with team collaboration features

# Generate tool configs
npx guvnr generate
```

## What Gets Generated

| Tool | Output | Docs |
|------|--------|------|
| Claude Code | `CLAUDE.md`, `.claude/commands/`, `.claude/agents/` | [docs](https://claude.ai) |
| Cursor | `.cursor/rules/` | [docs](https://docs.cursor.com) |
| GitHub Copilot | `.github/copilot-instructions.md` | [docs](https://docs.github.com/copilot) |
| Windsurf | `.windsurf/rules/` | [docs](https://docs.windsurf.com) |
| Aider | `.aider.conf.yml` | [docs](https://aider.chat) |
| AGENTS.md | `AGENTS.md` | [agents.md](https://agents.md) |

## Research Validation

All claims are verified against authoritative sources:

| Claim                             | Source                                                                                                                                   | Verified |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| 45% AI code has vulnerabilities   | [Veracode 2025](https://www.veracode.com/blog/genai-code-security-report/)                                                               | ✅       |
| 19% slowdown for experienced devs | [METR Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/)                                                   | ✅       |
| 86% XSS failure rate              | [Veracode 2025](https://www.helpnetsecurity.com/2025/08/07/create-ai-code-security-risks/)                                               | ✅       |
| ~20% package hallucination        | [Slopsquatting Research](https://www.bleepingcomputer.com/news/security/ai-hallucinated-code-dependencies-become-new-supply-chain-risk/) | ✅       |

## Dogfooded

Guvnr is built using itself. Every pattern you see here was validated through actual use during development.

## License

MIT © Guvnr Contributors
