#!/usr/bin/env bash
# Create or refresh GitHub Releases for version tags.
# Mirrors .github/workflows/release.yml note format via scripts/build-release-notes.sh.
#
# Usage:
#   ./scripts/backfill-github-releases.sh              # create missing releases only
#   ./scripts/backfill-github-releases.sh --dry-run    # preview without writing
#   ./scripts/backfill-github-releases.sh --refresh    # rewrite notes on existing releases too
set -euo pipefail

DRY_RUN=false
REFRESH=false
for arg in "$@"; do
  case "$arg" in
    --dry-run) DRY_RUN=true ;;
    --refresh) REFRESH=true ;;
    *)
      echo "error: unknown argument: $arg" >&2
      exit 1
      ;;
  esac
done

REPO="${GITHUB_REPOSITORY:-alisaitteke/noun-mcp}"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"

if ! command -v gh >/dev/null 2>&1; then
  echo "error: gh CLI is required (https://cli.github.com/)" >&2
  exit 1
fi

cd "$ROOT"
git fetch --tags --force origin

TAGS=()
while IFS= read -r tag; do
  TAGS+=("$tag")
done < <(git tag -l 'v*' --sort=v:refname)

if [[ ${#TAGS[@]} -eq 0 ]]; then
  echo "No v* tags found."
  exit 0
fi

echo "Found ${#TAGS[@]} tag(s) to process (oldest → newest)."

PREV=""
for TAG in "${TAGS[@]}"; do
  EXISTS=false
  if gh release view "$TAG" --repo "$REPO" >/dev/null 2>&1; then
    EXISTS=true
  fi

  if [[ "$EXISTS" == true && "$REFRESH" != true ]]; then
    echo "skip $TAG — release already exists (use --refresh to rewrite notes)"
    PREV="$TAG"
    continue
  fi

  BODY="$(bash scripts/build-release-notes.sh "$TAG" "${PREV}")"

  if [[ "$DRY_RUN" == true ]]; then
    action=$([[ "$EXISTS" == true ]] && echo "refresh" || echo "create")
    echo "dry-run: would $action release $TAG"
    echo "$BODY" | head -20
    echo "---"
  elif [[ "$EXISTS" == true ]]; then
    echo "refreshing release $TAG ..."
    gh release edit "$TAG" --repo "$REPO" --notes "$BODY"
  else
    echo "creating release $TAG ..."
    gh release create "$TAG" \
      --repo "$REPO" \
      --title "$TAG" \
      --notes "$BODY"
  fi

  PREV="$TAG"
done

echo "Done."
