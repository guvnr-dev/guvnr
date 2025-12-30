---
description: Multi-perspective code review
---

# Code Review

Perform a comprehensive code review from multiple perspectives.

## Review the following: $ARGUMENTS

### Perspective 1: Correctness

- Does the code do what it claims to do?
- Are there logic errors?
- Are edge cases handled?
- Could any inputs cause unexpected behavior?

### Perspective 2: Security

- Are there injection vulnerabilities (SQL, command, XSS)?
- Is sensitive data properly protected?
- Are authentication/authorization checks correct?
- Are there hardcoded secrets?

### Perspective 3: Performance

- Are there obvious inefficiencies?
- Could this cause N+1 queries?
- Are there unnecessary computations in loops?
- Is caching used appropriately?

### Perspective 4: Maintainability

- Is the code readable?
- Are naming conventions followed?
- Is there appropriate documentation?
- Would future developers understand this?

### Perspective 5: Testing

- Is the code testable?
- What test cases are missing?
- Are there assertions that could fail silently?

## Output Format

```markdown
## Code Review: [file/feature]

### Summary

[One sentence overall assessment]

### Critical Issues 🔴

- [Issue requiring immediate fix]

### Warnings 🟡

- [Issue that should be addressed]

### Suggestions 🟢

- [Nice-to-have improvements]

### What's Good ✓

- [Positive observations]
```
