#!/bin/bash
# Remind to update CLAUDE.md when significant changes are made

# Count changed source files
CHANGED_FILES=$(git diff --cached --name-only | grep -E '\.(ts|tsx|js|jsx|py|go|rs|sh)$' | wc -l)

# Check if CLAUDE.md was modified
CLAUDE_MODIFIED=$(git diff --cached --name-only | grep -c 'CLAUDE.md')

if [ "$CHANGED_FILES" -gt 5 ] && [ "$CLAUDE_MODIFIED" -eq 0 ]; then
    echo "⚠️  Warning: Significant code changes detected without CLAUDE.md update"
    echo "   Consider updating the 'Current State' section in CLAUDE.md"
    echo "   To skip this check: git commit --no-verify"
    echo ""
    # Warning only, don't block
    exit 0
fi

exit 0
