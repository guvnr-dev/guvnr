# IDE Integration Guide

This guide covers integrating the AI Excellence Framework with popular IDEs and code editors.

## Table of Contents

- [VS Code](#vs-code)
- [Cursor](#cursor)
- [JetBrains IDEs](#jetbrains-ides)
- [Neovim](#neovim)
- [Emacs](#emacs)
- [Configuration Sync](#configuration-sync)

---

## VS Code

### Claude Code Extension Setup

The official Claude Code VS Code extension provides seamless integration with the AI Excellence Framework.

#### Installation

1. Install the extension from VS Code Marketplace:
   - Open VS Code
   - Press `Ctrl+Shift+X` (Windows/Linux) or `Cmd+Shift+X` (macOS)
   - Search for "Claude Code"
   - Install the official Anthropic extension

2. Or install via CLI:
   ```bash
   code --install-extension anthropic.claude-code
   ```

#### Workspace Settings

Create `.vscode/settings.json` for workspace-specific configuration:

```json
{
  // Claude Code settings
  "claude-code.autoAcceptEdits": false,
  "claude-code.showInlineComments": true,
  "claude-code.maxTokensPerRequest": 4096,

  // Environment variables for custom providers
  "claude-code.environmentVariables": {
    "CLAUDE_MODEL": "claude-sonnet-4-20250514"
  },

  // Editor settings optimized for AI assistance
  "editor.formatOnSave": true,
  "editor.inlineSuggest.enabled": true,
  "editor.quickSuggestions": {
    "other": true,
    "comments": false,
    "strings": false
  },

  // File associations for framework files
  "files.associations": {
    "CLAUDE.md": "markdown",
    "CLAUDE.local.md": "markdown",
    ".claude/commands/*.md": "markdown",
    ".claude/agents/*.md": "markdown"
  },

  // Recommended extensions
  "recommendations": [
    "anthropic.claude-code",
    "davidanson.vscode-markdownlint",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint"
  ]
}
```

#### Tasks Configuration

Create `.vscode/tasks.json` for framework commands:

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "AIX: Validate Installation",
      "type": "shell",
      "command": "npx ai-excellence-framework validate",
      "group": "test",
      "presentation": {
        "reveal": "always",
        "panel": "new"
      }
    },
    {
      "label": "AIX: Health Check",
      "type": "shell",
      "command": "npx ai-excellence-framework doctor",
      "group": "test"
    },
    {
      "label": "AIX: Update Framework",
      "type": "shell",
      "command": "npx ai-excellence-framework update",
      "group": "build"
    },
    {
      "label": "AIX: Start MCP Server",
      "type": "shell",
      "command": "python3 scripts/mcp/project-memory-server.py",
      "isBackground": true,
      "problemMatcher": []
    },
    {
      "label": "Run Pre-commit Hooks",
      "type": "shell",
      "command": "pre-commit run --all-files",
      "group": "test"
    }
  ]
}
```

#### Launch Configuration

Create `.vscode/launch.json` for debugging:

```json
{
  "version": "0.2.0",
  "configurations": [
    {
      "name": "Debug MCP Server",
      "type": "python",
      "request": "launch",
      "program": "${workspaceFolder}/scripts/mcp/project-memory-server.py",
      "console": "integratedTerminal",
      "env": {
        "PROJECT_MEMORY_DB": "${workspaceFolder}/.tmp/test-memory.db"
      }
    },
    {
      "name": "Debug CLI",
      "type": "node",
      "request": "launch",
      "program": "${workspaceFolder}/bin/cli.js",
      "args": ["validate", "--verbose"],
      "console": "integratedTerminal"
    }
  ]
}
```

#### Recommended Extensions

Create `.vscode/extensions.json`:

```json
{
  "recommendations": [
    "anthropic.claude-code",
    "davidanson.vscode-markdownlint",
    "esbenp.prettier-vscode",
    "dbaeumer.vscode-eslint",
    "ms-python.python",
    "GitHub.copilot",
    "usernamehw.errorlens",
    "gruntfuggly.todo-tree",
    "eamodio.gitlens"
  ],
  "unwantedRecommendations": []
}
```

---

## Cursor

Cursor is an AI-native code editor that integrates naturally with the AI Excellence Framework.

### Configuration

Cursor uses the same configuration structure as VS Code. Create or update `.cursor/settings.json`:

```json
{
  // Cursor AI settings
  "cursor.cpp.disabledLanguages": [],
  "cursor.chat.enabled": true,
  "cursor.chat.showSuggestedFiles": true,

  // Context settings - crucial for AI assistance
  "cursor.context.enabled": true,
  "cursor.context.includeWorkspace": true,

  // Use CLAUDE.md as primary context
  "cursor.ai.contextFiles": [
    "CLAUDE.md",
    ".claude/commands/*.md",
    ".claude/agents/*.md"
  ],

  // Agent mode settings
  "cursor.agent.enabled": true,
  "cursor.agent.autoApprove": false,

  // Editor settings
  "editor.formatOnSave": true,
  "editor.inlineSuggest.enabled": true
}
```

### Cursor Rules File

Create `.cursorrules` in project root (equivalent to CLAUDE.md for Cursor):

```markdown
# Project Rules for Cursor AI

## Context
Read CLAUDE.md for complete project context before making changes.

## Conventions
- Follow existing code patterns in the codebase
- Use TypeScript strict mode
- Write tests for new functionality
- Run /verify before completing tasks

## Slash Commands
The following slash commands are available in .claude/commands/:
- /plan - Create implementation plan before coding
- /verify - Verify task completion with skeptical review
- /review - Multi-perspective code review
- /security-review - OWASP-focused security analysis

## Workflow
1. Read CLAUDE.md first
2. Use /plan before implementing
3. Use /verify before completing
4. Update "Current State" section after significant changes
```

### Cursor Composer Settings

For Cursor's Composer feature, create `.cursor/composer.json`:

```json
{
  "contextFiles": ["CLAUDE.md"],
  "excludePatterns": [
    "node_modules/**",
    ".git/**",
    "*.log",
    ".tmp/**"
  ],
  "maxContextLength": 32000,
  "preferredModel": "claude-sonnet-4-20250514"
}
```

---

## JetBrains IDEs

### Configuration for IntelliJ, WebStorm, PyCharm, etc.

#### AI Assistant Settings

1. Open Settings (`Ctrl+Alt+S` / `Cmd+,`)
2. Navigate to **Tools → AI Assistant**
3. Configure context settings

#### File Templates

Create file templates for framework files at `.idea/fileTemplates/`:

**CLAUDE.md.ft:**
```markdown
#parse("File Header.txt")
# Project: ${PROJECT_NAME}

## Overview
[Project description]

## Tech Stack
- Language:
- Framework:
- Database:

## Architecture
[Architecture overview]

## Conventions
[Coding conventions]

## Current State
[Current development status]

## Session Instructions
### Before Starting
1. Read this file completely
2. Run tests to verify baseline

### During Work
- Use /plan before implementing
- Use /verify before completing
```

#### Run Configurations

Create `.idea/runConfigurations/`:

**AIX_Validate.xml:**
```xml
<component name="ProjectRunConfigurationManager">
  <configuration name="AIX: Validate" type="ShConfigurationType">
    <option name="SCRIPT_TEXT" value="npx ai-excellence-framework validate" />
    <option name="INDEPENDENT_SCRIPT_PATH" value="true" />
    <option name="SCRIPT_PATH" value="" />
    <option name="SCRIPT_OPTIONS" value="" />
    <option name="INDEPENDENT_SCRIPT_WORKING_DIRECTORY" value="true" />
    <option name="SCRIPT_WORKING_DIRECTORY" value="$PROJECT_DIR$" />
    <option name="INDEPENDENT_INTERPRETER_PATH" value="true" />
    <option name="INTERPRETER_PATH" value="/bin/bash" />
    <method v="2" />
  </configuration>
</component>
```

#### Live Templates

Create live templates for common patterns:

**Settings → Editor → Live Templates → Create new group "AI Excellence"**

| Abbreviation | Template Text | Description |
|--------------|---------------|-------------|
| `aix-todo` | `// TODO(AIX): $COMMENT$` | AI Excellence TODO |
| `aix-verify` | `// VERIFY: $ASSERTION$` | Verification checkpoint |
| `aix-decision` | `/* DECISION: $DECISION$\n * RATIONALE: $RATIONALE$\n * DATE: $DATE$\n */` | Document decision |

#### Scope Configuration

Create a scope for framework files at **Settings → Appearance → Scopes**:

```
file:CLAUDE.md||file:CLAUDE.local.md||file:.claude//*||file:scripts/hooks//*||file:scripts/mcp//*
```

---

## Neovim

### Configuration with lua

Add to `~/.config/nvim/lua/plugins/ai-excellence.lua`:

```lua
-- AI Excellence Framework integration for Neovim
return {
  -- Claude.nvim or similar AI plugin
  {
    "your-ai-plugin",
    config = function()
      require("claude").setup({
        context_files = {
          "CLAUDE.md",
          ".claude/commands/*.md",
          ".claude/agents/*.md",
        },
        auto_context = true,
      })
    end,
  },

  -- Treesitter for better markdown parsing
  {
    "nvim-treesitter/nvim-treesitter",
    opts = {
      ensure_installed = { "markdown", "markdown_inline", "yaml" },
    },
  },

  -- Telescope for finding framework files
  {
    "nvim-telescope/telescope.nvim",
    keys = {
      { "<leader>ac", "<cmd>Telescope find_files search_dirs={'.claude/'}<cr>", desc = "Find Claude commands" },
      { "<leader>am", "<cmd>edit CLAUDE.md<cr>", desc = "Open CLAUDE.md" },
    },
  },
}
```

### Custom Commands

Add to `~/.config/nvim/lua/config/autocmds.lua`:

```lua
-- AI Excellence Framework commands
vim.api.nvim_create_user_command('AIXValidate', function()
  vim.cmd('!npx ai-excellence-framework validate')
end, { desc = 'Validate AI Excellence Framework installation' })

vim.api.nvim_create_user_command('AIXDoctor', function()
  vim.cmd('!npx ai-excellence-framework doctor')
end, { desc = 'Run AI Excellence health check' })

-- Auto-load CLAUDE.md on project open
vim.api.nvim_create_autocmd("VimEnter", {
  callback = function()
    if vim.fn.filereadable("CLAUDE.md") == 1 then
      vim.notify("AI Excellence Framework detected. CLAUDE.md available.", vim.log.levels.INFO)
    end
  end,
})

-- Highlight TODOs in Claude files
vim.api.nvim_create_autocmd("FileType", {
  pattern = { "markdown" },
  callback = function()
    vim.fn.matchadd("Todo", "\\<\\(TODO\\|VERIFY\\|DECISION\\)\\>")
  end,
})
```

---

## Emacs

### Configuration with use-package

Add to `~/.emacs.d/init.el` or `~/.config/emacs/init.el`:

```elisp
;; AI Excellence Framework integration

(use-package markdown-mode
  :ensure t
  :mode (("CLAUDE\\.md\\'" . gfm-mode)
         ("\\.claude/.*\\.md\\'" . gfm-mode)))

;; Custom functions for framework
(defun aix-validate ()
  "Validate AI Excellence Framework installation."
  (interactive)
  (compile "npx ai-excellence-framework validate"))

(defun aix-doctor ()
  "Run AI Excellence health check."
  (interactive)
  (compile "npx ai-excellence-framework doctor"))

(defun aix-open-claude-md ()
  "Open CLAUDE.md in current project."
  (interactive)
  (let ((claude-file (expand-file-name "CLAUDE.md" (project-root (project-current)))))
    (if (file-exists-p claude-file)
        (find-file claude-file)
      (message "No CLAUDE.md found in project root"))))

;; Keybindings
(global-set-key (kbd "C-c a v") 'aix-validate)
(global-set-key (kbd "C-c a d") 'aix-doctor)
(global-set-key (kbd "C-c a m") 'aix-open-claude-md)

;; Hook for project detection
(add-hook 'find-file-hook
  (lambda ()
    (when (and (project-current)
               (file-exists-p (expand-file-name "CLAUDE.md" (project-root (project-current)))))
      (message "AI Excellence Framework project detected"))))
```

---

## Configuration Sync

### Sharing IDE Configurations

To share IDE configurations across your team:

1. **Commit IDE-agnostic configs:**
   ```bash
   # Add these to version control
   git add .vscode/settings.json
   git add .vscode/tasks.json
   git add .vscode/extensions.json
   git add .cursorrules
   git add .editorconfig
   ```

2. **Create .editorconfig for cross-IDE consistency:**
   ```ini
   # .editorconfig
   root = true

   [*]
   indent_style = space
   indent_size = 2
   end_of_line = lf
   charset = utf-8
   trim_trailing_whitespace = true
   insert_final_newline = true

   [*.md]
   trim_trailing_whitespace = false

   [*.py]
   indent_size = 4

   [Makefile]
   indent_style = tab
   ```

3. **Gitignore user-specific settings:**
   ```gitignore
   # User-specific IDE settings
   .vscode/*.local.json
   .idea/workspace.xml
   .idea/tasks.xml
   .idea/usage.statistics.xml
   .cursor/settings.local.json
   ```

### Environment-Specific Overrides

Create local override files that are gitignored:

- `.vscode/settings.local.json` → merged with `settings.json`
- `.cursor/settings.local.json` → for personal Cursor settings
- `CLAUDE.local.md` → for personal session context

---

## Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| Extension not finding CLAUDE.md | Ensure file is in project root, not a subdirectory |
| Slow context loading | Reduce context file size; aim for <300 lines in CLAUDE.md |
| Commands not recognized | Reload window after creating `.claude/commands/` files |
| MCP server not connecting | Check `~/.claude/settings.json` has correct server configuration |

### Debugging

Enable verbose logging for debugging:

```bash
# For CLI
DEBUG=aix:* npx ai-excellence-framework validate

# For MCP server
PROJECT_MEMORY_LOG_LEVEL=DEBUG python3 scripts/mcp/project-memory-server.py
```

---

## Sources

- [Claude Code VS Code Extension](https://marketplace.visualstudio.com/items?itemName=anthropic.claude-code)
- [VS Code Claude Code Guide](https://code.claude.com/docs/en/vs-code)
- [Cursor Configuration](https://docs.cursor.com/)
- [JetBrains AI Assistant](https://www.jetbrains.com/ai/)
- [Anthropic: Claude Code Best Practices](https://www.anthropic.com/engineering/claude-code-best-practices)
