---
layout: home

hero:
  name: AI Excellence Framework
  text: Reduce Friction in AI-Assisted Development
  tagline: Research-backed tools and patterns for making AI coding assistants actually useful
  image:
    src: /logo.svg
    alt: AI Excellence Framework
  actions:
    - theme: brand
      text: Get Started
      link: /getting-started
    - theme: alt
      text: View on GitHub
      link: https://github.com/ai-excellence-framework/ai-excellence-framework

features:
  - icon: 🎯
    title: Research-Backed
    details: Built on verified research from Veracode, METR, and OWASP. Every claim is fact-checked against authoritative sources.
  - icon: 🔒
    title: Security-First
    details: Address the 45% vulnerability rate in AI-generated code with OWASP-aligned reviews and slopsquatting prevention.
  - icon: ⚡
    title: Copy-Paste Ready
    details: Every component works when literally copied. No "adapt to your needs" hand-waving.
  - icon: 🧠
    title: Persistent Memory
    details: MCP server with SQLite storage preserves decisions, patterns, and context across sessions.
  - icon: 📋
    title: Structured Workflows
    details: 8 slash commands for planning, verification, handoffs, security reviews, and more.
  - icon: 🤖
    title: Smart Subagents
    details: Specialized agents for exploration (Haiku), code review, and test generation.
---

## The Problem

**AI coding assistants are simultaneously loved and distrusted.**

- **46%** of developers distrust AI accuracy, yet **85%** use AI tools regularly
- **65%** report AI misses critical context during complex tasks
- **45%** of AI-generated code contains security vulnerabilities
- **19%** slower completion for experienced developers (despite believing they're faster)

*Sources: [Stack Overflow 2025](https://survey.stackoverflow.co/2025/ai), [METR Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/), [Veracode](https://www.veracode.com/blog/genai-code-security-report/)*

## The Solution

AI Excellence Framework provides **structured patterns** that address these friction points:

### 🎯 Context Management
```markdown
# CLAUDE.md
Every session starts with consistent project context.
No more re-explaining your codebase.
```

### 🔍 Verification Protocol
```bash
/verify  # Skeptical validation with falsification
```
*"Assume nothing is complete until proven otherwise."*

### 🔒 Security Scanning
```bash
/security-review src/api/
```
*OWASP-aligned, with AI-specific vulnerability checks.*

### 🤝 Session Continuity
```bash
/handoff  # Generate comprehensive session summary
```
*Never lose context between sessions again.*

## Quick Start

```bash
# Install in any project
npx ai-excellence-framework init

# Choose your preset
? Select a configuration preset:
  > Standard - Recommended for individual developers
    Minimal - CLAUDE.md + essential commands only
    Full - Complete setup with MCP server and metrics
    Team - Full setup with team collaboration features
```

## What You Get

| Component | Purpose |
|-----------|---------|
| **CLAUDE.md** | Project context for every session |
| **8 Slash Commands** | /plan, /verify, /handoff, /review, and more |
| **3 Subagents** | Explorer, Reviewer, Tester |
| **MCP Server** | Persistent memory with search |
| **Git Hooks** | Security scanning, dependency verification |
| **Metrics** | Track what's working |

## Research Validation

All claims in this framework are verified against authoritative sources:

| Claim | Source | Verified |
|-------|--------|----------|
| 45% AI code has vulnerabilities | [Veracode 2025](https://www.veracode.com/blog/genai-code-security-report/) | ✅ |
| 19% slowdown for experienced devs | [METR Study](https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/) | ✅ |
| 86% XSS failure rate | [Veracode 2025](https://www.helpnetsecurity.com/2025/08/07/create-ai-code-security-risks/) | ✅ |
| ~20% package hallucination | [Slopsquatting Research](https://www.bleepingcomputer.com/news/security/ai-hallucinated-code-dependencies-become-new-supply-chain-risk/) | ✅ |
| 65% context loss in refactoring | [Developer Surveys](https://www.secondtalent.com/resources/ai-coding-assistant-statistics/) | ✅ |

## Dogfooded

This framework was built using itself. Every pattern you see here was validated through actual use during development.

See the [Dogfooding Log](/docs/dogfooding) for real-world effectiveness data.

## License

MIT © AI Excellence Framework Contributors
