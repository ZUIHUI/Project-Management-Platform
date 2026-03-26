#!/usr/bin/env bash
set -euo pipefail

TARGET_BRANCH="${1:-codex/draft-ai-driven-system-restructuring-specifications-uzj6gf}"

if ! git rev-parse --verify "$TARGET_BRANCH" >/dev/null 2>&1; then
  echo "[info] Branch '$TARGET_BRANCH' not found locally."
  echo "[info] Fetch remote branch first, e.g.: git fetch origin $TARGET_BRANCH:$TARGET_BRANCH"
  exit 2
fi

CURRENT_BRANCH="$(git branch --show-current)"
echo "[info] Current branch: ${CURRENT_BRANCH}"
echo "[info] Merging '${TARGET_BRANCH}' into '${CURRENT_BRANCH}'..."

set +e
git merge --no-ff "$TARGET_BRANCH"
MERGE_EXIT=$?
set -e

if [[ $MERGE_EXIT -eq 0 ]]; then
  echo "[ok] Merge completed without conflicts."
  exit 0
fi

echo "[warn] Merge produced conflicts. Attempting deterministic conflict policy..."

# Prefer target branch for generated lock artifacts and keep combined docs when possible.
if git ls-files -u | cut -f2 | grep -q '^apps/web/yarn.lock$'; then
  git checkout --theirs apps/web/yarn.lock || true
  git add apps/web/yarn.lock || true
fi

if git ls-files -u | cut -f2 | grep -q '^docs/'; then
  while IFS= read -r f; do
    git checkout --ours "$f" || true
    git add "$f" || true
  done < <(git ls-files -u | cut -f2 | sort -u | grep '^docs/')
fi

if git diff --name-only --diff-filter=U | grep -q '.'; then
  echo "[error] Unresolved conflicts remain:"
  git diff --name-only --diff-filter=U
  exit 1
fi

echo "[ok] Conflicts resolved by policy. Review and commit the merge."
