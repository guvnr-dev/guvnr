---
description: Generate session handoff summary
---

# Session Handoff

Generate a comprehensive handoff summary for the next session.

## Generate handoff for this session

### Required Sections

1. **Session Summary**
   - What was the main goal?
   - What was accomplished?
   - What approach was taken?

2. **Decisions Made**
   - List each significant decision
   - Include the rationale
   - Note any alternatives considered

3. **Files Changed**
   - List all files created/modified/deleted
   - Brief description of changes

4. **Current State**
   - What works now that didn't before?
   - What's partially complete?
   - What's blocked?

5. **Open Questions**
   - Unresolved decisions
   - Areas needing clarification
   - Technical uncertainties

6. **Recommended Next Steps**
   - Prioritized list of what to do next
   - Any time-sensitive items

7. **Gotchas & Warnings**
   - Things the next session should be careful about
   - Non-obvious dependencies
   - Potential pitfalls

## Output

Save to: `docs/session-notes/[DATE]-handoff.md`

```markdown
# Session Handoff: [DATE]

## Summary
[2-3 sentence summary]

## Accomplished
- [x] [Completed item]
- [ ] [Partially complete item]

## Decisions
| Decision | Rationale | Alternatives Considered |
|----------|-----------|------------------------|
| [decision] | [why] | [other options] |

## Files Changed
- `path/to/file.ts` - [what changed]

## Current State
[Description of where things stand]

## Blockers
- [Blocker and what's needed to resolve]

## Next Steps
1. [Priority 1]
2. [Priority 2]
3. [Priority 3]

## Warnings
⚠️ [Thing to be careful about]
```
