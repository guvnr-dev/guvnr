# Guvnr — Quick Reference

> One-page guide to using the framework effectively

---

## 🚀 Quick Start (60 seconds)

```bash
# Install
npx guvnr init

# Or manually copy files
cp -r .claude/ your-project/.claude/
cp CLAUDE.md your-project/

# Start using
claude
/plan add user authentication
```

---

## 📋 Slash Commands

| Command                   | When to Use                   | Key Output                       |
| ------------------------- | ----------------------------- | -------------------------------- |
| `/plan [task]`            | Before implementing anything  | Structured plan with assumptions |
| `/verify [task]`          | Before marking work complete  | Verification report with gaps    |
| `/handoff`                | End of session                | Session summary for continuity   |
| `/assumptions [task]`     | When requirements are unclear | Documented assumptions + risks   |
| `/review [code]`          | After significant changes     | Multi-perspective code review    |
| `/security-review [path]` | For security-sensitive code   | OWASP-aligned security audit     |
| `/refactor [target]`      | Before refactoring            | Safe refactoring plan            |
| `/test-coverage [target]` | When improving tests          | Coverage gaps + test plan        |

---

## 🏗️ CLAUDE.md Structure

```markdown
# Project Name

## Overview ← What the project does (1 paragraph)

## Tech Stack ← Languages, frameworks, versions

## Architecture ← Directory structure, key patterns

## Conventions ← Code style, commit messages

## Common Commands ← npm/yarn commands

## Current State ← Active work, recent decisions

## Session Instructions ← Before/during/after session
```

**Keep it under 300 lines. Use pointers, not copies.**

---

## 🔐 Security Checklist

Before every commit, verify:

- [ ] No hardcoded secrets or credentials
- [ ] Input validation present where needed
- [ ] No SQL/command/XSS injection vulnerabilities
- [ ] Dependencies exist (not hallucinated names)
- [ ] Error handling doesn't expose internals

Run `/security-review` for thorough check.

---

## 📁 Directory Structure

```
your-project/
├── CLAUDE.md                    # Project context (required)
├── .claude/
│   ├── commands/                # Slash commands
│   │   ├── plan.md
│   │   ├── verify.md
│   │   └── ...
│   └── agents/                  # Custom subagents
│       ├── reviewer.md
│       ├── explorer.md
│       └── tester.md
├── scripts/
│   ├── hooks/                   # Git hooks
│   │   ├── verify-deps.sh       # Slopsquatting prevention
│   │   └── post-edit.sh         # Auto-formatting
│   ├── mcp/                     # MCP server
│   │   └── project-memory-server.py
│   └── metrics/                 # Session metrics
│       └── collect-session-metrics.sh
├── docs/
│   └── session-notes/           # Handoff notes
└── .tmp/                        # Ephemeral files (gitignored)
```

---

## ⚡ Workflow Patterns

### Starting a Session

```
1. Read CLAUDE.md
2. Check docs/session-notes/ for recent context
3. Run tests: npm test
4. Plan first task: /plan [task]
```

### During Work

```
1. Use /plan before implementing
2. Use /assumptions if unclear
3. Use /verify before completing
4. Track progress with TodoWrite
```

### Ending a Session

```
1. Run /handoff
2. Update CLAUDE.md "Current State"
3. Commit work in progress
4. Optionally run metrics collection
```

---

## 🛡️ AI-Specific Security Risks

| Risk                  | Prevalence         | Prevention            |
| --------------------- | ------------------ | --------------------- |
| XSS vulnerabilities   | 86% of AI code     | Use /security-review  |
| Log injection         | 88% of AI code     | Sanitize log inputs   |
| Hallucinated packages | 20% of suggestions | Run verify-deps.sh    |
| Privilege escalation  | 322% more common   | Review access control |
| Hardcoded secrets     | Common             | Use pre-commit hooks  |

---

## 🔧 Pre-commit Hooks

```bash
# Install
pip install pre-commit
pre-commit install

# Run manually
pre-commit run --all-files

# What it checks:
# - Secrets detection (gitleaks, detect-secrets)
# - Dependency vulnerabilities (safety, npm audit)
# - AI-specific patterns (log injection, eval)
# - Code formatting (prettier, black, ruff)
```

---

## 📊 Metrics Collection

```bash
# Establish baseline
./scripts/metrics/collect-session-metrics.sh --baseline

# End-of-session metrics
./scripts/metrics/collect-session-metrics.sh

# Automated collection
./scripts/metrics/collect-session-metrics.sh --auto

# View report
./scripts/metrics/collect-session-metrics.sh --report
```

---

## 🧠 MCP Memory Server

```bash
# Install
pip install mcp

# Run server
python scripts/mcp/project-memory-server.py

# Tools available:
# - remember_decision: Store architectural decisions
# - recall_decisions: Search past decisions
# - store_pattern: Save code patterns
# - get_patterns: Retrieve patterns
# - set_context / get_context: Key-value storage
# - memory_stats: Database statistics
```

---

## 🔍 Troubleshooting

| Problem                           | Solution                       |
| --------------------------------- | ------------------------------ |
| Context rebuilding takes too long | Update CLAUDE.md, use /handoff |
| Commands not found                | Check .claude/commands/ exists |
| Pre-commit hooks failing          | Run `pre-commit install`       |
| MCP server won't start            | Run `pip install mcp`          |
| Tests failing                     | Run `npm install` first        |

---

## 📚 Full Documentation

| Document                        | Purpose                                |
| ------------------------------- | -------------------------------------- |
| `ai-development-friction.md`    | 59 friction points from AI perspective |
| `ai-friction-mitigations.md`    | 40+ evidence-based strategies          |
| `ai-friction-implementation.md` | Implementation blueprints              |
| `ai-friction-action-plan.md`    | Strategic adoption roadmap             |

---

## 🎯 Key Principles

1. **Plan before coding** — `/plan` prevents rework
2. **Verify before completing** — `/verify` catches gaps
3. **Handoff before ending** — `/handoff` enables continuity
4. **Research before recommending** — Search online for best practices
5. **Security is non-negotiable** — Use pre-commit hooks + `/security-review`

---

_Guvnr v1.0.0_
