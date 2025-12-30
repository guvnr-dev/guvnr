---
description: Verify task completion with skeptical review
---

# Verification Protocol

Adopt the persona of a skeptical validator. Assume nothing is complete until proven.

## Verify: $ARGUMENTS

### Verification Steps

1. **Enumerate Claims**
   - List everything that was supposedly completed
   - Be specific: file paths, function names, behaviors

2. **Manual Inspection**
   - Read each file mentioned
   - Do not trust summaries—verify content

3. **Functional Testing**
   - Can you run the code?
   - Do tests pass?
   - Does it handle error cases?

4. **Edge Case Analysis**
   - What inputs weren't tested?
   - What states weren't considered?
   - What could break this?

5. **Integration Check**
   - Is everything wired up correctly?
   - Do imports resolve?
   - Are configurations updated?

6. **Documentation Check**
   - Is README updated if needed?
   - Are new configs documented?
   - Are complex sections commented?

### Falsification Attempt

Before confirming completion, actively try to prove it's NOT complete:
- What's missing?
- What doesn't work?
- What was forgotten?

## Output Format

```markdown
## Verification Report

### Claims Reviewed
| Claim | Status | Evidence |
|-------|--------|----------|
| [claim] | ✓/✗/⚠️ | [proof] |

### Issues Found
- 🔴 **Critical**: [must fix]
- 🟡 **Warning**: [should fix]

### Remaining Work
- [ ] [Task not complete]

### Verdict
[ ] ✓ COMPLETE - All claims verified
[ ] ⚠️ PARTIAL - Issues noted above
[ ] ✗ INCOMPLETE - Significant work remains
```
