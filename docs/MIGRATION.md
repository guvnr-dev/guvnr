# Migration Guide

Upgrade paths and breaking change documentation for Guvnr.

## Current Version: 1.0.0

This is the initial release of Guvnr. Future versions will include migration guides here.

## Installing 1.0.0

```bash
# Install the framework
npm install guvnr

# Initialize in your project
npx guvnr init --preset standard

# Verify installation
npx guvnr doctor
```

## Presets

Choose your configuration level:

| Preset     | Use Case           | Features                      |
| ---------- | ------------------ | ----------------------------- |
| `minimal`  | Quick start        | CLAUDE.md + /plan + /verify   |
| `standard` | Individual devs    | All commands + agents + hooks |
| `full`     | Complete setup     | + MCP server + metrics        |
| `team`     | Team collaboration | + memory federation           |

```bash
# Examples
npx guvnr init --preset minimal
npx guvnr init --preset standard
npx guvnr init --preset full
npx guvnr init --preset team
```

## Generating Tool Configurations

Generate configurations for your AI coding tools:

```bash
# Generate for all 25 supported tools
npx guvnr generate --tools all

# Generate for specific tools
npx guvnr generate --tools cursor,copilot,windsurf

# Preview without writing files
npx guvnr generate --tools all --dry-run
```

## Validating Your Setup

```bash
# Check configuration
npx guvnr validate

# Auto-fix issues
npx guvnr validate --fix

# Detailed health check
npx guvnr doctor --verbose
```

---

## Future Migrations

When new versions are released, migration guides will be added here with:

- Breaking changes
- Step-by-step upgrade instructions
- Configuration format changes
- Deprecation notices

## Getting Help

- [Troubleshooting Guide](./TROUBLESHOOTING.md)
- [GitHub Issues](https://github.com/guvnr-dev/guvnr/issues)
- [Documentation](https://guvnr.dev/)
