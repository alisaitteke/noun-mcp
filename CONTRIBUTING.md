# Contributing to Noun MCP

Thank you for your interest in contributing. This is an unofficial, community-maintained project and is not affiliated with or endorsed by The Noun Project.

## Language policy

This project uses **English** as its canonical language for all project artifacts:

- **Pull request titles, descriptions, and commit messages** must be written in English.
- **Source code, comments, and user-facing strings** must be written in English.
- **Documentation** (README, guides, inline docs) must be written in English.
- **Locale READMEs** (`README.zh-CN.md`, `README.es.md`, `README.de.md`, `README.ja.md`, `README.tr.md`) must stay in sync with the English landing page in `README.md`. Canonical guides under `docs/` remain English-only.

Issues and review comments may be written in any language, but English is preferred so maintainers and future contributors can search and reference them easily.

## Before you start

1. Search [existing issues](https://github.com/alisaitteke/noun-mcp/issues) and [pull requests](https://github.com/alisaitteke/noun-mcp/pulls) to avoid duplicate work.
2. For large or architectural changes, open an issue first to discuss the approach.
3. For bug fixes and small improvements, a PR without a prior issue is fine.

## Development setup

### Prerequisites

- **Node.js** ≥ 18
- **npm**
- Noun Project API credentials (`NOUN_CONSUMER_KEY`, `NOUN_CONSUMER_SECRET`) for live API checks

### Getting started

```bash
git clone https://github.com/alisaitteke/noun-mcp.git
cd noun-mcp
npm install
cp .env.example .env
npm test
```

## Releasing

Version bumps ship from **`master`**. Pushing a version tag triggers the
[Release workflow](.github/workflows/release.yml), which creates a GitHub Release,
publishes to npm, publishes metadata to the [Official MCP Registry](https://registry.modelcontextprotocol.io),
and refreshes release notes once npm is live.

**One-time setup:** add an npm automation token as the repository secret `NPM_TOKEN`
(Settings → Secrets and variables → Actions). Use an npm **Automation** or
**Publish** token scoped to `@alisaitteke/noun-mcp` (or the whole org). Confirm with:

```bash
./scripts/check-release-secrets.sh
```

1. Merge feature work to `master`.
2. Bump the `version` field in [`package.json`](package.json).
3. Regenerate [`CHANGELOG.md`](CHANGELOG.md) and commit the release (tag is
   created **after** the commit — `backfill-changelog.sh` reads `package.json`
   for the pending version):

   ```bash
   ./scripts/backfill-changelog.sh
   npm run sync:server-version
   git add CHANGELOG.md package.json server.json
   git commit -m "X.Y.Z"
   git tag vX.Y.Z
   ```

4. Tag and push:

   ```bash
   git tag vX.Y.Z
   git push origin master
   git push origin vX.Y.Z
   ```

5. Wait for the [Release workflow](.github/workflows/release.yml) to finish, then
   verify the new release on the repo **Releases** page. The workflow publishes to
   npm and the MCP Registry, then refreshes release notes with **✅ Published on
   npm.** Each release includes install commands, npm registry link,
   [CHANGELOG.md](CHANGELOG.md) anchor, categorized commits, and PR links (when `#123`
   appears in messages). See [`scripts/build-release-notes.sh`](scripts/build-release-notes.sh).

   If publish failed but the GitHub Release exists, fix the issue and re-run the
   failed **publish** job from Actions, or run [Refresh Release Notes](.github/workflows/refresh-release-notes.yml)
   after a manual `npm publish` + `./mcp-publisher publish`.

   npm scans every new version before it is installable ([publish-time malware
   scanning](https://github.blog/changelog/2026-07-28-npm-publish-time-malware-scanning-and-dual-use-metadata/)).
   The package page may show **Validating** for ~5–15 minutes; `npm view` 404s
   during that window even after `npm publish` succeeded. The Release workflow
   treats that as success and skips MCP Registry with a warning. Once the
   version is live, run [Publish MCP Registry](.github/workflows/publish-mcp-registry.yml).

Always tag the **release commit on `master`**, not a feature branch. Re-pushing an
existing tag is safe — the workflow updates the GitHub Release for that tag.

Versions **1.0.0–1.0.3** were published to npm without GitHub `v*` tags. The first
automated release should bump past `1.0.3` and push `vX.Y.Z`.

To backfill releases for tags that predate this workflow, run once:

```bash
./scripts/backfill-github-releases.sh
```

To rewrite release notes on existing releases (e.g. after improving the template):

```bash
./scripts/backfill-github-releases.sh --refresh
```

## Registry listings

### Official MCP Registry

Metadata lives in [`server.json`](server.json). The Release workflow publishes to
[registry.modelcontextprotocol.io](https://registry.modelcontextprotocol.io) after
each npm publish (`mcp-publisher` via GitHub OIDC). `npm run sync:server-version`
keeps `server.json` aligned with `package.json` before tagging.

If npm is already live but registry metadata is stale, run
[Publish MCP Registry](.github/workflows/publish-mcp-registry.yml) for that tag.
