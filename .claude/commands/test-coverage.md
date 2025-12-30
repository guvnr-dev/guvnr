---
description: Analyze and improve test coverage
---

# Test Coverage Analysis

Analyze test coverage and identify gaps.

## Analyze: $ARGUMENTS

### Phase 1: Current State Assessment

1. **Run Coverage Report**
   - Execute test suite with coverage enabled
   - Identify overall coverage percentage
   - List files with lowest coverage

2. **Coverage Breakdown**
   - Line coverage: What percentage of lines are executed?
   - Branch coverage: Are both sides of conditionals tested?
   - Function coverage: Are all functions called?

3. **Critical Path Identification**
   - Which code paths handle errors?
   - Which code paths handle edge cases?
   - Which code paths are business-critical?

### Phase 2: Gap Analysis

1. **Uncovered Code Types**
   - Error handlers never triggered
   - Edge cases never tested
   - Dead code that should be removed
   - New code not yet tested

2. **Risk Assessment**
   - Rank uncovered code by business impact
   - Identify high-risk low-coverage areas
   - Flag security-sensitive uncovered code

### Phase 3: Test Recommendations

1. **Missing Unit Tests**
   - Functions without direct tests
   - Branches without coverage
   - Error cases not tested

2. **Missing Integration Tests**
   - API endpoints without tests
   - Component interactions untested
   - Data flow paths not covered

3. **Missing Edge Case Tests**
   - Boundary conditions
   - Empty/null inputs
   - Large inputs
   - Concurrent access

## Output Format

```markdown
## Test Coverage Report: [target]

### Summary

| Metric            | Current | Target | Gap |
| ----------------- | ------- | ------ | --- |
| Line Coverage     | X%      | 80%    | +Y% |
| Branch Coverage   | X%      | 75%    | +Y% |
| Function Coverage | X%      | 90%    | +Y% |

### Lowest Coverage Files

| File   | Coverage | Risk Level   | Priority |
| ------ | -------- | ------------ | -------- |
| [file] | X%       | High/Med/Low | P1/P2/P3 |

### Critical Gaps 🔴

Code that MUST have tests:

- `[file:function]` - [why critical]

### Recommended Tests

#### High Priority

1. **Test: [test name]**
   - Target: `[file:function]`
   - Type: unit/integration/e2e
   - Cases: [what to test]

#### Medium Priority

2. **Test: [test name]**
   - Target: `[file:function]`
   - Type: unit/integration/e2e
   - Cases: [what to test]

### Dead Code Candidates

Code with 0% coverage that may be dead:

- `[file:line]` - [investigation notes]

### Quick Wins

Tests that would significantly improve coverage with minimal effort:

- [ ] [test description] → +X% coverage
```

## Test Generation Guidelines

When generating tests, ensure:

1. **Naming Convention**
   - Descriptive test names: `should [expected behavior] when [condition]`

2. **Test Structure**
   - Arrange: Set up test data
   - Act: Execute the function
   - Assert: Verify the outcome

3. **Coverage Types**
   - Happy path (normal operation)
   - Error path (expected failures)
   - Edge cases (boundaries, empty, null)
   - Security cases (injection, overflow)

4. **Assertions**
   - Test return values
   - Test side effects
   - Test error messages
   - Test state changes
