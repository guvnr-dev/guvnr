# Agentic AI Foundation (AAIF)

> Understanding the Linux Foundation initiative standardizing AI agent ecosystems

## Overview

The **Agentic AI Foundation (AAIF)** was announced on December 9, 2025, as a directed fund under the Linux Foundation. It was co-founded by Anthropic, Block, and OpenAI to establish open standards for AI agents.

## Why AAIF Matters

AAIF addresses critical challenges in the AI agent ecosystem:

| Challenge              | AAIF Solution                   |
| ---------------------- | ------------------------------- |
| Fragmented protocols   | Unified MCP standard            |
| Vendor lock-in         | Open, vendor-neutral governance |
| Security concerns      | Shared safety principles        |
| Integration complexity | Cross-platform compatibility    |

## Founding Members

### Platinum Members

- Amazon Web Services (AWS)
- Anthropic
- Block
- Bloomberg
- Cloudflare
- Google
- Microsoft
- OpenAI

### Additional Partners

Gold and Silver partners include: Shopify, Snowflake, Datadog, Docker, IBM, JetBrains, Salesforce, Uber, and many more.

## Core Projects

AAIF stewards three inaugural open-source projects:

### 1. Model Context Protocol (MCP)

**The universal standard for connecting AI models to tools, data, and applications.**

- 10,000+ published MCP servers
- Adopted by Claude, Cursor, Copilot, Gemini, VS Code, ChatGPT
- Enables structured communication between AI and external systems

```json
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    }
  }
}
```

### 2. AGENTS.md

**A universal standard for AI agent project-specific guidance.**

- Released by OpenAI in August 2025
- Adopted by 60,000+ open-source projects
- Supported by Amp, Codex, Cursor, Devin, Gemini CLI, GitHub Copilot, and more

```markdown
# AGENTS.md

## Project Overview

Project-specific instructions for AI agents...

## Build & Test

Commands for building and testing...

## Security Guidelines

Security requirements for generated code...
```

### 3. Goose

**An open-source, local-first AI agent framework.**

- Created by Block
- Runs entirely locally (privacy-first)
- Extensible via MCP servers
- Structured, reliable agentic workflows

```bash
# Install Goose
brew install goose

# Start interactive session
goose
```

## Governance Model

AAIF operates under vendor-neutral governance to prevent any single company from controlling the standards:

### Decision Making

- **Technical Steering Committees**: Project maintainers from multiple organizations
- **Consensus-Based**: Decisions require broad agreement
- **Open Participation**: Anyone can contribute to specifications

### Specification Enhancement Proposals (SEPs)

Changes to specifications follow a formal SEP process:

1. **Draft**: Initial proposal with rationale
2. **Review**: Community feedback period
3. **Refinement**: Address concerns and iterate
4. **Acceptance**: Formal adoption by steering committee
5. **Implementation**: Reference implementations created

## Impact on AI Excellence Framework

This framework is fully aligned with AAIF standards:

### AGENTS.md Compliance

Our `generate agents` command creates AAIF-compliant AGENTS.md files:

```bash
npx ai-excellence-framework generate --tools agents
```

### MCP Integration

All our MCP documentation and configurations follow the AAIF-stewarded specification:

- [MCP Security Guide](./MCP-SECURITY.md)
- [MCP Tasks Guide](./MCP-TASKS.md)
- [MCP OAuth Guide](./MCP-OAUTH.md)
- [MCP Registry Guide](./MCP-REGISTRY.md)

### Goose Support

Generate Goose configurations with:

```bash
npx ai-excellence-framework generate --tools goose
```

## The Vision: "W3C for Agentic AI"

Block has stated they hope AAIF becomes "what the W3C is for the Web" — a set of standards and protocols ensuring interoperability across the agentic AI ecosystem.

### Key Goals

1. **Interoperability**: Agents from different vendors work together
2. **Safety**: Shared principles for responsible AI agent behavior
3. **Transparency**: Open specifications anyone can implement
4. **Innovation**: Common foundation enables faster ecosystem growth

## Timeline

| Date     | Milestone                             |
| -------- | ------------------------------------- |
| Nov 2024 | MCP released by Anthropic             |
| Mar 2025 | OpenAI adopts MCP                     |
| Aug 2025 | AGENTS.md released by OpenAI          |
| Sep 2025 | MCP Registry preview launches         |
| Nov 2025 | MCP November 2025 spec (Tasks)        |
| Dec 2025 | AAIF announced under Linux Foundation |

## Getting Started with AAIF Standards

### 1. Add AGENTS.md to Your Project

```bash
# Using AI Excellence Framework
npx ai-excellence-framework generate --tools agents

# Or manually create AGENTS.md with:
# - Project overview
# - Build & test commands
# - Coding conventions
# - Security guidelines
```

### 2. Configure MCP Servers

```json
// .mcp.json or equivalent
{
  "mcpServers": {
    "memory": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-memory"]
    },
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@anthropic-ai/mcp-server-filesystem", "--allowed-directories", "."]
    }
  }
}
```

### 3. Use AAIF-Aligned Tools

Tools supporting AAIF standards:

- Claude Code
- GitHub Copilot
- Cursor
- Windsurf
- Block Goose
- OpenAI Codex CLI
- Sourcegraph Amp
- Continue.dev
- And more...

## Resources

### Official Links

- [AAIF Website](https://aaif.io)
- [Linux Foundation Announcement](https://www.linuxfoundation.org/press/linux-foundation-announces-the-formation-of-the-agentic-ai-foundation)
- [MCP Specification](https://modelcontextprotocol.io)
- [AGENTS.md Specification](https://agents.md)
- [Goose Documentation](https://block.github.io/goose/)

### Related Guides

- [MCP Security](./MCP-SECURITY.md)
- [MCP Tasks](./MCP-TASKS.md)
- [MCP Registry](./MCP-REGISTRY.md)
- [MCP OAuth](./MCP-OAUTH.md)

## FAQ

### Is AAIF controlled by any single company?

No. AAIF operates under Linux Foundation governance with decisions made by steering committees composed of maintainers from multiple organizations.

### Do I need to pay to use AAIF standards?

No. All AAIF projects (MCP, AGENTS.md, Goose) are open source and free to use.

### How do I contribute to AAIF specifications?

Contributions are made through the respective project repositories on GitHub. Follow the SEP process for specification changes.

### Will my existing MCP servers continue to work?

Yes. AAIF maintains backward compatibility. Existing MCP servers will continue to function.

---

_Part of the [AI Excellence Framework](https://github.com/ai-excellence-framework/ai-excellence-framework)_
