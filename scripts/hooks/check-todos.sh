#!/bin/bash
# Check for TODO/FIXME comments that might indicate incomplete work

# Look for high-priority markers in staged files
CRITICAL_TODOS=$(git diff --cached | grep -E '^\+.*\b(TODO|FIXME|HACK|XXX)\b.*(!|CRITICAL|URGENT|BLOCKING)' || true)

if [ -n "$CRITICAL_TODOS" ]; then
    echo "🔴 Critical TODOs found in staged changes:"
    echo "$CRITICAL_TODOS"
    echo ""
    echo "These should be resolved before committing."
    echo "To override: git commit --no-verify"
    exit 1
fi

# Count regular TODOs (warning only)
TODO_COUNT=$(git diff --cached | grep -cE '^\+.*\b(TODO|FIXME)\b' || true)

if [ "$TODO_COUNT" -gt 3 ]; then
    echo "⚠️  Warning: $TODO_COUNT new TODO/FIXME comments in this commit"
    echo "   Consider addressing these before committing"
fi

exit 0
