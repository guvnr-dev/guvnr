# Error Codes Reference

This document provides a complete reference for all Guvnr error codes.

## Error Code Format

Error codes follow the format: `GUVNR-{CATEGORY}-{NUMBER}`

- **GUVNR**: Guvnr prefix
- **CATEGORY**: Error category (INIT, VALID, CONFIG, FS, NET, MCP, HOOK, GEN)
- **NUMBER**: Specific error number within the category

## Categories

| Category | Range   | Description           |
| -------- | ------- | --------------------- |
| INIT     | 100-199 | Initialization errors |
| VALID    | 200-299 | Validation errors     |
| CONFIG   | 300-399 | Configuration errors  |
| FS       | 400-499 | Filesystem errors     |
| NET      | 500-599 | Network errors        |
| MCP      | 600-699 | MCP server errors     |
| HOOK     | 700-799 | Hook errors           |
| GEN      | 900-999 | General errors        |

---

## Initialization Errors (GUVNR-INIT-xxx)

### GUVNR-INIT-100

**General initialization failure**

The framework failed to initialize for an unspecified reason.

**Solution:** Check file permissions and try again with `--verbose` flag for more details.

### GUVNR-INIT-101

**Directory already contains framework files**

The target directory already has Guvnr files installed.

**Solution:** Use `--force` to overwrite existing files, or use `--dry-run` to preview changes first.

### GUVNR-INIT-102

**Invalid preset specified**

The preset name provided is not recognized.

**Solution:** Valid presets are: `minimal`, `standard`, `full`, `team`

### GUVNR-INIT-103

**Failed to create directory structure**

Could not create the required directory structure.

**Solution:** Check write permissions for the target directory.

### GUVNR-INIT-104

**Template file not found**

A required template file is missing from the installation.

**Solution:** Reinstall the framework: `npm install -g guvnr`

### GUVNR-INIT-105

**Interactive prompts not available**

The command requires interactive input but the terminal doesn't support it.

**Solution:** Use `--yes` flag for non-interactive mode, or run in an interactive terminal.

---

## Validation Errors (GUVNR-VALID-xxx)

### GUVNR-VALID-200

**General validation failure**

Validation failed for an unspecified reason.

**Solution:** Run `aix validate --verbose` for detailed validation output.

### GUVNR-VALID-201

**CLAUDE.md file is missing**

The project doesn't have a CLAUDE.md file.

**Solution:** Run `aix init` to create CLAUDE.md or create it manually.

### GUVNR-VALID-202

**CLAUDE.md missing required sections**

The CLAUDE.md file is missing one or more required sections.

**Solution:** Required sections are: `## Overview`, `## Tech Stack`, `## Current State`

### GUVNR-VALID-203

**Configuration schema validation failed**

The configuration file doesn't match the expected schema.

**Solution:** Check `guvnr.yaml` against the schema.

### GUVNR-VALID-204

**Slash command file is malformed**

A slash command file has invalid structure.

**Solution:** Slash commands must have YAML frontmatter with a "description" field.

### GUVNR-VALID-205

**Agent definition is malformed**

An agent definition file has invalid structure.

**Solution:** Agent files must have YAML frontmatter with "name" and "description" fields.

### GUVNR-VALID-206

**Hook script is not executable**

A hook script doesn't have execute permissions.

**Solution:** Run: `chmod +x scripts/hooks/*.sh`

---

## Configuration Errors (GUVNR-CONFIG-xxx)

### GUVNR-CONFIG-300

**General configuration error**

A configuration error occurred.

**Solution:** Check `guvnr.yaml` for syntax errors.

### GUVNR-CONFIG-301

**Configuration file not found**

The configuration file doesn't exist.

**Solution:** Run `aix init` to create configuration or create `guvnr.yaml` manually.

### GUVNR-CONFIG-302

**Invalid JSON in configuration file**

The configuration file contains invalid JSON.

**Solution:** Validate JSON syntax at https://jsonlint.com/

### GUVNR-CONFIG-303

**Unknown configuration option**

The configuration file contains an unrecognized option.

**Solution:** Check documentation for valid configuration options.

### GUVNR-CONFIG-304

**Incompatible configuration version**

The configuration file version is not compatible with the current framework version.

**Solution:** Run `aix update` to migrate configuration to current version.

---

## Filesystem Errors (GUVNR-FS-xxx)

### GUVNR-FS-400

**General filesystem error**

A filesystem operation failed.

**Solution:** Check file permissions and disk space.

### GUVNR-FS-401

**Permission denied**

The operation was denied due to insufficient permissions.

**Solution:** Check file/directory permissions or run with appropriate privileges.

### GUVNR-FS-402

**File not found**

The specified file doesn't exist.

**Solution:** Verify the file path exists and is spelled correctly.

### GUVNR-FS-403

**Directory not found**

The specified directory doesn't exist.

**Solution:** Create the directory first or check the path.

### GUVNR-FS-404

**Disk space insufficient**

There isn't enough disk space for the operation.

**Solution:** Free up disk space and try again.

### GUVNR-FS-405

**File already exists and overwrite not allowed**

The target file exists and the operation doesn't allow overwriting.

**Solution:** Use `--force` flag to overwrite or rename the existing file.

---

## Network Errors (GUVNR-NET-xxx)

### GUVNR-NET-500

**General network error**

A network operation failed.

**Solution:** Check internet connection and try again.

### GUVNR-NET-501

**Failed to download template**

Could not download a template from the network.

**Solution:** Check internet connection or use offline installation.

### GUVNR-NET-502

**Registry unreachable**

The npm registry cannot be reached.

**Solution:** Check npm registry configuration and network connectivity.

---

## MCP Server Errors (GUVNR-MCP-xxx)

### GUVNR-MCP-600

**General MCP server error**

An error occurred with the MCP server.

**Solution:** Check MCP server logs and configuration.

### GUVNR-MCP-601

**MCP server failed to start**

The MCP server could not start.

**Solution:** Check Python installation and MCP SDK: `pip install mcp`

### GUVNR-MCP-602

**MCP database initialization failed**

The MCP database could not be initialized.

**Solution:** Check write permissions for `~/.claude/project-memories/`

### GUVNR-MCP-603

**MCP connection pool exhausted**

All database connections are in use.

**Solution:** Increase `PROJECT_MEMORY_POOL_SIZE` environment variable.

### GUVNR-MCP-604

**MCP rate limit exceeded**

Too many operations in a short time period.

**Solution:** Wait before retrying or increase `PROJECT_MEMORY_RATE_LIMIT`.

### GUVNR-MCP-605

**MCP data import failed**

Failed to import data from a backup file.

**Solution:** Verify the import file is valid JSON from a previous export.

---

## Hook Errors (GUVNR-HOOK-xxx)

### GUVNR-HOOK-700

**General hook error**

A hook operation failed.

**Solution:** Check hook script syntax and permissions.

### GUVNR-HOOK-701

**Pre-commit hook installation failed**

Could not install pre-commit hooks.

**Solution:** Install pre-commit: `pip install pre-commit && pre-commit install`

### GUVNR-HOOK-702

**Hook script execution failed**

A hook script failed to execute.

**Solution:** Check script syntax: `bash -n scripts/hooks/script.sh`

### GUVNR-HOOK-703

**Hook blocked by security policy**

A hook was blocked due to security settings.

**Solution:** Review hook commands against allowed commands in settings.json.

---

## General Errors (GUVNR-GEN-xxx)

### GUVNR-GEN-900

**Unknown error occurred**

An unexpected error occurred.

**Solution:** Run with `--verbose` flag and report issue on GitHub.

### GUVNR-GEN-901

**Operation cancelled by user**

The user cancelled the operation.

**Solution:** No action needed.

### GUVNR-GEN-902

**Operation timed out**

The operation took too long and was cancelled.

**Solution:** Try again or increase timeout if available.

### GUVNR-GEN-903

**Unsupported Node.js version**

The Node.js version is too old.

**Solution:** Upgrade to Node.js 18.x or higher.

### GUVNR-GEN-904

**Unsupported operating system**

The operation is not supported on the current OS.

**Solution:** This operation is not supported on your operating system.

---

## Getting Help

If you encounter an error not listed here or need additional help:

1. Run the command with `--verbose` for detailed output
2. Check the [Troubleshooting Guide](./TROUBLESHOOTING.md)
3. Search [existing issues](https://github.com/guvnr-dev/guvnr/issues)
4. Open a new issue with the error code and verbose output
