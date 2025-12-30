# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.5.0] - 2025-12-30

### Added

#### Multi-Tool Support

- **AGENTS.md generation** — Linux Foundation standard adopted by 60K+ projects
- **Cursor rules** — `.cursor/rules/*.mdc` with YAML frontmatter
- **GitHub Copilot instructions** — `.github/copilot-instructions.md`
- **Windsurf rules** — `.windsurf/rules/` with character limit compliance
- **Aider configuration** — `.aider.conf.yml` with auto-commit/lint/test

#### New CLI Commands

- `aix generate` — Generate configurations for multiple AI coding tools
- `aix lint` — Validate configuration files with best practice checks
- Support for `--tools all|cursor|copilot|windsurf|agents|aider`

#### OpenSSF Alignment

- Full alignment with [OpenSSF Security Guide for AI Code Assistants](https://best.openssf.org)
- RCI (Recursive Criticism and Improvement) pattern in security review
- Research-backed: RCI fixes 41.9%-68.7% of vulnerabilities

#### Security Enhancements

- OWASP Top 10 for LLM Applications 2025 coverage
- Automated fix suggestions with code patterns
- Prompt injection protection patterns
- Dependency verification commands

### Changed

- Updated security-review command with OpenSSF RCI methodology
- Enhanced CLAUDE.md parser for multi-tool generation
- Improved test coverage for new commands
- Updated package.json with new keywords for discoverability

### Fixed

- Version constant alignment between package.json and src/index.js

## [1.4.0] - 2024-12-30

### Added

- VitePress documentation site with 30+ pages
- Comprehensive command documentation
- Agent documentation pages
- Enterprise deployment guide
- VS Code integration guide
- Model selection guide
- TypeScript type definitions for programmatic API
- Structured error system with 80+ error codes

### Changed

- Updated research citations with December 2024 verification
- Improved CLAUDE.md templates with <300 line guidance
- Enhanced MCP server with connection pooling

### Fixed

- VitePress configuration paths
- GitHub repository URLs

## [1.3.0] - 2024-12-29

### Added

- MCP server with connection pooling and rate limiting
- SQLite WAL mode for concurrent access
- Full-text search for decisions
- Memory cleanup functionality
- Export/import for backup and portability
- VitePress site configuration
- MCP security documentation
- Research citations verification document

### Changed

- Enhanced pre-commit hooks
- Improved test coverage

## [1.2.0] - 2024-12-28

### Added

- CLI tool with init, validate, doctor, update commands
- 4 preset templates (minimal, standard, full, team)
- Configuration validation schemas
- Degit templates for distribution
- Automated test suites (unit, integration, E2E)
- TL;DR summaries for verbose documents

### Changed

- Reorganized template structure
- Improved error handling

## [1.1.0] - 2024-12-27

### Added

- All 8 slash commands
- All 3 subagents (explorer, reviewer, tester)
- Pre-commit hook templates
- Metrics collection script
- Session notes infrastructure

### Changed

- Refined command output formats
- Improved agent tool configurations

## [1.0.0] - 2024-12-26

### Added

- Initial framework release
- Core friction documentation (59 points)
- Mitigation strategies (40+)
- Implementation blueprints
- CLAUDE.md pattern
- Basic pre-commit hooks

---

## Version History Summary

| Version | Focus                                                                               |
| ------- | ----------------------------------------------------------------------------------- |
| 1.5.0   | Multi-tool support (Cursor, Copilot, Windsurf, Aider, AGENTS.md), OpenSSF alignment |
| 1.4.0   | VitePress documentation, enterprise features                                        |
| 1.3.0   | MCP server production features                                                      |
| 1.2.0   | CLI installer and templates                                                         |
| 1.1.0   | Commands and agents                                                                 |
| 1.0.0   | Initial release                                                                     |
