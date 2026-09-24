#!/usr/bin/env bash
# Point git at the versioned hooks in .githooks/.
# core.hooksPath rather than copying into .git/hooks: the hooks stay tracked, so a
# change to them reaches everyone on the next pull instead of going stale.

set -euo pipefail

REPO_ROOT="$(git rev-parse --show-toplevel)"
cd "$REPO_ROOT"

chmod +x .githooks/* 2>/dev/null || true
git config core.hooksPath .githooks

# git ignores a non-executable hook without saying so, which would look enabled.
for hook in pre-commit pre-push; do
    if [ ! -x ".githooks/$hook" ]; then
        echo "ERROR: .githooks/$hook is not executable, so git will ignore it." >&2
        echo "Run: chmod +x .githooks/$hook" >&2
        exit 1
    fi
done

echo "Hooks enabled (core.hooksPath -> .githooks)."
echo
echo "  pre-commit  ESLint --fix + Prettier on staged frontend files (lint-staged)"
echo "  pre-push    the check.sh of every area you touched (frontend today)"
echo
echo "Bypass once with:     git commit --no-verify / git push --no-verify"
echo "Disable entirely with: git config --unset core.hooksPath"
