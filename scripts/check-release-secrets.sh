#!/usr/bin/env bash
# Verify GitHub Actions secrets required for automated releases.
# Usage: ./scripts/check-release-secrets.sh
set -euo pipefail

REPO="${1:-$(gh repo view --json nameWithOwner -q .nameWithOwner 2>/dev/null || true)}"
if [[ -z "$REPO" ]]; then
  echo "Could not detect GitHub repo. Pass owner/repo as the first argument." >&2
  exit 1
fi

echo "Checking Actions secrets for ${REPO}…"
if gh secret list -R "$REPO" --json name -q '.[].name' 2>/dev/null | grep -qx 'NPM_TOKEN'; then
  echo "OK: NPM_TOKEN is configured."
else
  echo "MISSING: NPM_TOKEN"
  echo "Add an npm Automation or Publish token:"
  echo "  https://github.com/${REPO}/settings/secrets/actions/new"
  echo "Name: NPM_TOKEN"
  exit 1
fi
