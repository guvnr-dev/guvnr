---
description: Surface and document assumptions before implementation
---

# Assumption Surfacing

Before proceeding with: $ARGUMENTS

## Required Analysis

### 1. Explicit Assumptions

List assumptions you're consciously making:

- Technical assumptions (APIs, libraries, patterns)
- Business assumptions (requirements, priorities)
- Environmental assumptions (runtime, dependencies)

### 2. Implicit Assumptions

Try to surface assumptions you might not realize you're making:

- What are you NOT questioning that you should?
- What seems "obvious" but might not be?
- What would change your approach if false?

### 3. Questions Not Asked

List questions you should probably ask but were going to skip:

- Clarifications about requirements
- Decisions that could go multiple ways
- Areas where you're guessing

### 4. Risk Assessment

For each major assumption:

- What happens if it's wrong?
- How would you detect if it's wrong?
- Is it reversible?

## Output Format

```markdown
## Assumptions for: [task]

### I'm Assuming...

| Assumption   | Confidence   | Impact if Wrong | Verify? |
| ------------ | ------------ | --------------- | ------- |
| [assumption] | High/Med/Low | [impact]        | Yes/No  |

### Questions I Should Ask

1. [Question] - [why it matters]

### Risks

- **[Risk]**: [mitigation strategy]

### Proceed?

[ ] All assumptions are safe to proceed with
[ ] Need clarification on: [items]
```
