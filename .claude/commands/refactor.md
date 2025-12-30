---
description: Plan and execute code refactoring safely
---

# Refactoring Protocol

Safely refactor code with verification at each step.

## Refactor: $ARGUMENTS

### Phase 1: Analysis

1. **Identify Current State**
   - Read all files involved in the refactoring
   - Understand current behavior and dependencies
   - Map out what calls what

2. **Document Behavior**
   - List all public interfaces/APIs
   - Identify expected inputs and outputs
   - Note any side effects

3. **Risk Assessment**
   - What could break?
   - What depends on this code?
   - Are there tests covering this?

### Phase 2: Planning

1. **Define Goals**
   - What improvement does this refactoring achieve?
   - Is this reducing complexity, improving performance, or fixing architecture?

2. **Scope the Work**
   - List all files that need to change
   - Identify order of changes (dependencies first)
   - Set boundaries (what we WON'T change)

3. **Verify Test Coverage**
   - Run existing tests before any changes
   - Identify gaps in coverage
   - Consider adding tests before refactoring

### Phase 3: Execution

1. **Apply Changes Incrementally**
   - Make one logical change at a time
   - Keep each change small enough to verify
   - Maintain working state at each step

2. **Verify After Each Change**
   - Run tests after each modification
   - Manually verify behavior still matches
   - Check for regression

3. **Preserve Public Interfaces**
   - Don't change signatures without explicit approval
   - If interface must change, update all callers
   - Consider deprecation over breaking changes

### Phase 4: Verification

1. **Run Full Test Suite**
2. **Compare Behavior Before/After**
3. **Review All Changed Files**
4. **Check for Orphaned Code**

## Output Format

```markdown
## Refactoring Plan: [target]

### Current State
[Description of what exists now]

### Goals
- [Goal 1]: [Expected outcome]
- [Goal 2]: [Expected outcome]

### Risk Analysis
| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| [risk] | High/Med/Low | [impact] | [mitigation] |

### Files to Modify
| File | Change | Order |
|------|--------|-------|
| [file] | [description] | [1/2/3...] |

### Test Coverage Check
- [ ] Existing tests pass before refactoring
- [ ] Coverage: [X%] of target code
- [ ] Tests needed: [list]

### Boundaries
- WILL change: [scope]
- WON'T change: [out of scope]

### Rollback Plan
[How to undo if something goes wrong]

### Execution Checklist
- [ ] Step 1: [action] → verify [how]
- [ ] Step 2: [action] → verify [how]
- [ ] Final: All tests pass, behavior unchanged
```

## Critical Rules

1. **NEVER refactor without understanding current behavior first**
2. **ALWAYS have tests before refactoring (or add them)**
3. **Make commits at each stable point for rollback capability**
4. **If tests don't exist, treat refactoring as higher risk**
