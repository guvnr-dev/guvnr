# Claude Agent SDK Guide

> Build production AI agents with Claude Code as a library

The Claude Agent SDK allows you to build AI agents that autonomously read files, run commands, search the web, edit code, and more. It provides the same tools, agent loop, and context management that power Claude Code, programmable in Python and TypeScript.

## Overview

The Agent SDK gives you:

- **Built-in Tools**: File operations, code execution, web search, and more
- **Context Management**: Automatic compaction and session management
- **MCP Integration**: Connect to databases, browsers, APIs, and [hundreds of servers](https://github.com/modelcontextprotocol/servers)
- **Advanced Permissions**: Fine-grained control over agent capabilities
- **Hooks System**: Run custom code at key points in the agent lifecycle
- **Subagents**: Spawn specialized agents for focused subtasks
- **Sessions**: Maintain context across multiple exchanges

## Installation

### Prerequisites

The SDK requires Claude Code as its runtime:

```bash
# macOS/Linux/WSL
curl -fsSL https://claude.ai/install.sh | bash

# Homebrew
brew install --cask claude-code

# npm
npm install -g @anthropic-ai/claude-code
```

### Install the SDK

::: code-group

```bash [TypeScript]
npm install @anthropic-ai/claude-agent-sdk
```

```bash [Python]
pip install claude-agent-sdk
```

:::

### Authentication

Set your API key:

```bash
export ANTHROPIC_API_KEY=your-api-key
```

Get your key from the [Anthropic Console](https://console.anthropic.com/).

**Alternative providers:**

- **Amazon Bedrock**: `CLAUDE_CODE_USE_BEDROCK=1`
- **Google Vertex AI**: `CLAUDE_CODE_USE_VERTEX=1`
- **Microsoft Foundry**: `CLAUDE_CODE_USE_FOUNDRY=1`

## Quick Start

### Basic Example

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Find and fix the bug in auth.py",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Edit", "Bash"])
    ):
        print(message)

asyncio.run(main())
```

```typescript [TypeScript]
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: 'Find and fix the bug in auth.py',
  options: { allowedTools: ['Read', 'Edit', 'Bash'] }
})) {
  console.log(message);
}
```

:::

## Built-in Tools

The SDK includes powerful tools out of the box:

| Tool          | Description                                      |
| ------------- | ------------------------------------------------ |
| **Read**      | Read any file in the working directory           |
| **Write**     | Create new files                                 |
| **Edit**      | Make precise edits to existing files             |
| **Bash**      | Run terminal commands, scripts, git operations   |
| **Glob**      | Find files by pattern (`**/*.ts`, `src/**/*.py`) |
| **Grep**      | Search file contents with regex                  |
| **WebSearch** | Search the web for current information           |
| **WebFetch**  | Fetch and parse web page content                 |
| **Task**      | Spawn subagents for specialized tasks            |

### Example: Codebase Search

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Find all TODO comments and create a summary",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Glob", "Grep"])
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

```typescript [TypeScript]
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: 'Find all TODO comments and create a summary',
  options: { allowedTools: ['Read', 'Glob', 'Grep'] }
})) {
  if ('result' in message) console.log(message.result);
}
```

:::

## Subagents

Spawn specialized agents to handle focused subtasks:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions, AgentDefinition

async def main():
    async for message in query(
        prompt="Use the code-reviewer agent to review this codebase",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep", "Task"],
            agents={
                "code-reviewer": AgentDefinition(
                    description="Expert code reviewer for quality and security reviews.",
                    prompt="Analyze code quality and suggest improvements.",
                    tools=["Read", "Glob", "Grep"]
                )
            }
        )
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

```typescript [TypeScript]
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: 'Use the code-reviewer agent to review this codebase',
  options: {
    allowedTools: ['Read', 'Glob', 'Grep', 'Task'],
    agents: {
      'code-reviewer': {
        description: 'Expert code reviewer for quality and security reviews.',
        prompt: 'Analyze code quality and suggest improvements.',
        tools: ['Read', 'Glob', 'Grep']
      }
    }
  }
})) {
  if ('result' in message) console.log(message.result);
}
```

:::

## MCP Integration

Connect to external systems via the Model Context Protocol:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Open example.com and describe what you see",
        options=ClaudeAgentOptions(
            mcp_servers={
                "playwright": {"command": "npx", "args": ["@playwright/mcp@latest"]}
            }
        )
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

```typescript [TypeScript]
import { query } from '@anthropic-ai/claude-agent-sdk';

for await (const message of query({
  prompt: 'Open example.com and describe what you see',
  options: {
    mcpServers: {
      playwright: { command: 'npx', args: ['@playwright/mcp@latest'] }
    }
  }
})) {
  if ('result' in message) console.log(message.result);
}
```

:::

## Hooks

Run custom code at key points in the agent lifecycle:

**Available hooks:** `PreToolUse`, `PostToolUse`, `Stop`, `SessionStart`, `SessionEnd`, `UserPromptSubmit`

::: code-group

```python [Python]
import asyncio
from datetime import datetime
from claude_agent_sdk import query, ClaudeAgentOptions, HookMatcher

async def log_file_change(input_data, tool_use_id, context):
    file_path = input_data.get('tool_input', {}).get('file_path', 'unknown')
    with open('./audit.log', 'a') as f:
        f.write(f"{datetime.now()}: modified {file_path}\n")
    return {}

async def main():
    async for message in query(
        prompt="Refactor utils.py to improve readability",
        options=ClaudeAgentOptions(
            permission_mode="acceptEdits",
            hooks={
                "PostToolUse": [HookMatcher(matcher="Edit|Write", hooks=[log_file_change])]
            }
        )
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

```typescript [TypeScript]
import { query, HookCallback } from '@anthropic-ai/claude-agent-sdk';
import { appendFileSync } from 'fs';

const logFileChange: HookCallback = async input => {
  const filePath = (input as any).tool_input?.file_path ?? 'unknown';
  appendFileSync('./audit.log', `${new Date().toISOString()}: modified ${filePath}\n`);
  return {};
};

for await (const message of query({
  prompt: 'Refactor utils.py to improve readability',
  options: {
    permissionMode: 'acceptEdits',
    hooks: {
      PostToolUse: [{ matcher: 'Edit|Write', hooks: [logFileChange] }]
    }
  }
})) {
  if ('result' in message) console.log(message.result);
}
```

:::

## Sessions

Maintain context across multiple exchanges:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    session_id = None

    # First query: capture the session ID
    async for message in query(
        prompt="Read the authentication module",
        options=ClaudeAgentOptions(allowed_tools=["Read", "Glob"])
    ):
        if hasattr(message, 'subtype') and message.subtype == 'init':
            session_id = message.session_id

    # Resume with full context from the first query
    async for message in query(
        prompt="Now find all places that call it",
        options=ClaudeAgentOptions(resume=session_id)
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

```typescript [TypeScript]
import { query } from '@anthropic-ai/claude-agent-sdk';

let sessionId: string | undefined;

// First query: capture the session ID
for await (const message of query({
  prompt: 'Read the authentication module',
  options: { allowedTools: ['Read', 'Glob'] }
})) {
  if (message.type === 'system' && message.subtype === 'init') {
    sessionId = message.session_id;
  }
}

// Resume with full context from the first query
for await (const message of query({
  prompt: 'Now find all places that call it',
  options: { resume: sessionId }
})) {
  if ('result' in message) console.log(message.result);
}
```

:::

## Permissions

Control exactly which tools your agent can use:

::: code-group

```python [Python]
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    # Read-only agent that can analyze but not modify
    async for message in query(
        prompt="Review this code for best practices",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep"],
            permission_mode="bypassPermissions"
        )
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(main())
```

```typescript [TypeScript]
import { query } from '@anthropic-ai/claude-agent-sdk';

// Read-only agent that can analyze but not modify
for await (const message of query({
  prompt: 'Review this code for best practices',
  options: {
    allowedTools: ['Read', 'Glob', 'Grep'],
    permissionMode: 'bypassPermissions'
  }
})) {
  if ('result' in message) console.log(message.result);
}
```

:::

## Integration with Guvnr

The Claude Agent SDK works seamlessly with Guvnr. Use the framework's configurations with the SDK:

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    async for message in query(
        prompt="Use the security-review agent to analyze the codebase",
        options=ClaudeAgentOptions(
            # Load project configuration from CLAUDE.md
            setting_sources=["project"],
            # Use framework Skills
            allowed_tools=["Read", "Glob", "Grep", "Task", "Skill"],
        )
    ):
        print(message)

asyncio.run(main())
```

### Framework Features in SDK

| Feature            | Description                          | Location                  |
| ------------------ | ------------------------------------ | ------------------------- |
| **Skills**         | Specialized capabilities in Markdown | `.claude/skills/SKILL.md` |
| **Slash Commands** | Custom commands for tasks            | `.claude/commands/*.md`   |
| **Memory**         | Project context and instructions     | `CLAUDE.md`               |
| **Plugins**        | Extend with commands, agents, MCP    | `.claude-plugin/`         |

## Use Cases

### Deep Research Agent

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def research_agent():
    async for message in query(
        prompt="Research the authentication patterns used in this codebase and write a summary",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Glob", "Grep", "WebSearch", "Write"]
        )
    ):
        if hasattr(message, "result"):
            print(message.result)

asyncio.run(research_agent())
```

### CI/CD Integration

```python
import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def ci_review():
    async for message in query(
        prompt="Review the changes in the last commit for security issues",
        options=ClaudeAgentOptions(
            allowed_tools=["Read", "Bash", "Glob", "Grep"],
            permission_mode="bypassPermissions"
        )
    ):
        if hasattr(message, "result"):
            return message.result

# Run in CI pipeline
result = asyncio.run(ci_review())
```

## Resources

- **Official Documentation**: [platform.claude.com/docs/en/agent-sdk/overview](https://platform.claude.com/docs/en/agent-sdk/overview)
- **TypeScript SDK**: [github.com/anthropics/claude-agent-sdk-typescript](https://github.com/anthropics/claude-agent-sdk-typescript)
- **Python SDK**: [github.com/anthropics/claude-agent-sdk-python](https://github.com/anthropics/claude-agent-sdk-python)
- **Example Agents**: [github.com/anthropics/claude-agent-sdk-demos](https://github.com/anthropics/claude-agent-sdk-demos)
- **npm Package**: [@anthropic-ai/claude-agent-sdk](https://www.npmjs.com/package/@anthropic-ai/claude-agent-sdk)

## SDK vs CLI Comparison

| Use Case                | Best Choice     |
| ----------------------- | --------------- |
| Interactive development | Claude Code CLI |
| CI/CD pipelines         | Agent SDK       |
| Custom applications     | Agent SDK       |
| One-off tasks           | Claude Code CLI |
| Production automation   | Agent SDK       |

Many teams use both: CLI for daily development, SDK for production workflows.

---

_Part of [Guvnr](https://github.com/guvnr-dev/guvnr)_
