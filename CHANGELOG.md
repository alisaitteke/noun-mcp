# Changelog

All notable changes to this project are documented here.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.0.5] - 2026-09-16

### Fixed

- Release workflow waits until the npm version is readable and retries MCP Registry publish, so a just-published package is not rejected with a 404.

## [1.0.4] - 2026-09-16

### Added

- Request layer: typed `ApiError`, 429/5xx retry with a Retry-After cap, GET LRU cache, and v2 hourly/daily/monthly × service/icon quota harvesting.
- GitHub Release workflow that publishes to npm (with provenance) and the Official MCP Registry when a `v*` tag is pushed.

### Changed

- FREE vs PAID docs now match Noun Project trial and Pay-Per-Use windows instead of a single 5,000 calls/month bucket.
- `prepare` no longer rebuilds from a published tarball (source checkout only). `prepublishOnly` runs a clean build, syncs `server.json`, and verifies packed ESM imports.

## [1.0.3] - 2026-03-24

npm publish of the 1.0.3 package (no GitHub `v*` tag).

## [1.0.2] - 2026-01-27

npm publish of the 1.0.2 package (no GitHub `v*` tag).

## [1.0.1] - 2026-01-27

- Added `server.json` for Official MCP Registry metadata and `mcpName` in `package.json`.

## [1.0.0] - 2026-01-24

Initial public release: MCP server for searching and downloading Noun Project icons.
