#!/bin/bash
# Auto-lint and format after file edits

FILE_PATH="$1"

if [ -z "$FILE_PATH" ]; then
    exit 0
fi

# Get file extension
EXT="${FILE_PATH##*.}"

case "$EXT" in
    ts|tsx|js|jsx)
        npx eslint --fix "$FILE_PATH" 2>/dev/null || true
        npx prettier --write "$FILE_PATH" 2>/dev/null || true
        ;;
    py)
        black "$FILE_PATH" 2>/dev/null || true
        ruff check --fix "$FILE_PATH" 2>/dev/null || true
        ;;
    go)
        gofmt -w "$FILE_PATH" 2>/dev/null || true
        ;;
    rs)
        rustfmt "$FILE_PATH" 2>/dev/null || true
        ;;
    md)
        npx prettier --write "$FILE_PATH" 2>/dev/null || true
        ;;
esac

echo "✓ Auto-formatted: $FILE_PATH"
