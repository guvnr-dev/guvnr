---
name: project-standards
description: Apply project coding standards, conventions, and best practices. Activate when writing or reviewing code.
---

# Project Standards Skill

This skill ensures code follows the project's established patterns and conventions.

## When to Use

Activate this skill when:

- Writing new code in this repository
- Reviewing or modifying existing code
- Setting up new components or modules
- Implementing features or fixing bugs

## Coding Conventions

### General Rules

- Follow existing code patterns in the repository
- Use consistent naming conventions
- Write self-documenting code with clear variable names
- Add JSDoc/docstrings for public APIs
- Prefer explicit over implicit

### Naming Conventions

- **Variables/Functions**: camelCase
- **Classes/Components**: PascalCase
- **Constants**: SCREAMING_SNAKE_CASE
- **Files**: kebab-case

### Code Style

- Use consistent indentation (2 spaces recommended)
- Keep functions focused and small (<50 lines)
- Prefer composition over inheritance
- Avoid deep nesting (max 3 levels)

## Testing Requirements

- Write unit tests for new functionality
- Ensure tests pass before committing: `npm test`
- Include edge cases in test coverage
- Use descriptive test names

## Commit Standards

Use conventional commits:

- `feat:` new features
- `fix:` bug fixes
- `docs:` documentation changes
- `refactor:` code improvements
- `test:` test additions/changes
- `chore:` maintenance tasks

## Verification Commands

```bash
npm test        # Run tests
npm run lint    # Check code style
npm run build   # Verify build
```

## Files to Avoid

Never modify without explicit permission:

- `.env` files (contain secrets)
- Lock files (package-lock.json, yarn.lock)
- Generated files in dist/ or build/
- Migration files (create new ones instead)
