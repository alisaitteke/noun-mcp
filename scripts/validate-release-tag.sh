#!/usr/bin/env bash
# Fail fast when a release tag is on the wrong commit.
#
# Usage: scripts/validate-release-tag.sh <tag> [previous-tag]
set -euo pipefail

TAG="${1:?tag required (e.g. v1.0.4)}"
PREV="${2:-}"
TAG_VERSION="${TAG#v}"

TAG_SHA="$(git rev-parse "${TAG}^{commit}")"

if [[ -n "$PREV" ]]; then
  PREV_SHA="$(git rev-parse "${PREV}^{commit}")"
  if [[ "$TAG_SHA" == "$PREV_SHA" ]]; then
    echo "error: ${TAG} points to the same commit as ${PREV} (${TAG_SHA})" >&2
    echo "Create the tag on the release commit after merging and bumping package.json." >&2
    exit 1
  fi
fi

PKG_VERSION="$(node -p "require('./package.json').version")"
if [[ "$PKG_VERSION" != "$TAG_VERSION" ]]; then
  echo "error: package.json version (${PKG_VERSION}) does not match tag (${TAG_VERSION})" >&2
  exit 1
fi

SERVER_VERSION="$(node -p "require('./server.json').version")"
if [[ "$SERVER_VERSION" != "$TAG_VERSION" ]]; then
  echo "error: server.json version (${SERVER_VERSION}) does not match tag (${TAG_VERSION})" >&2
  exit 1
fi

echo "Release tag ${TAG} is valid (${TAG_SHA})."
