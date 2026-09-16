# Noun MCP

<p align="center">
  <a href="https://github.com/alisaitteke/noun-mcp">
    <img src="./docs/hero.png" alt="Noun MCP — search and download The Noun Project icons from your AI assistant" width="100%" />
  </a>
</p>

**Languages:** English · [简体中文](README.zh-CN.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [Türkçe](README.tr.md)

[![npm version](https://img.shields.io/npm/v/@alisaitteke/noun-mcp.svg)](https://www.npmjs.com/package/@alisaitteke/noun-mcp)
[![GitHub release](https://img.shields.io/github/v/release/alisaitteke/noun-mcp?include_prereleases)](https://github.com/alisaitteke/noun-mcp/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.alisaitteke%2Fnoun--mcp-purple.svg)](https://registry.modelcontextprotocol.io)
[![MCP Toplist](https://mcptoplist.com/badge/io.github.alisaitteke/noun-mcp.svg)](https://mcptoplist.com/server/io.github.alisaitteke/noun-mcp)

[![Noun MCP Server MCP server – quality and maintenance score on Glama](https://glama.ai/mcp/servers/alisaitteke/noun-mcp/badges/card.svg)](https://glama.ai/mcp/servers/alisaitteke/noun-mcp)

**Ask for icons in plain words.** Describe what you need — "a solid coffee cup, public domain" —
and your AI assistant searches The Noun Project, picks a match, and downloads SVG or PNG into
your project. Works with Cursor, Claude Desktop, and Claude Code.

> **Note:** This is an unofficial, community-maintained project and is not affiliated with or endorsed by The Noun Project.

## What can it do?

- **Search** — filter by style, line weight, and public-domain license
- **Download** — SVG or PNG, custom color and size, saved to a path you choose
- **Browse collections** — curated icon sets, not just one-off searches
- **Autocomplete** — get better search terms before you burn quota
- **Track usage** — hourly, daily, and monthly service vs icon windows
- **Stay on the free trial** — client-side caps so 150 icon calls/month last longer

Under the hood: 7 tools — full list in [`docs/available-tools.md`](docs/available-tools.md).

## Try saying

```
Find solid public-domain coffee cup icons, then download one as a red SVG into ./icons.
```

```
Suggest search terms for "spo", then search weather collections.
```

```
How many Noun Project API calls have I used this month?
```

## Get started

You need **Node.js 18+** and **Noun Project API keys** ([create an app](https://thenounproject.com/developers/apps/) — a free account works). Set `NOUN_API_TIER` to `FREE` (2,000 service / 150 icon calls per month) or `PAID`. Quota details: [`docs/available-tools.md`](docs/available-tools.md#free-vs-paid).

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=noun-project&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBhbGlzYWl0dGVrZS9ub3VuLW1jcCJdLCJlbnYiOnsiTk9VTl9DT05TVU1FUl9LRVkiOiJ5b3VyX2tleSIsIk5PVU5fQ09OU1VNRVJfU0VDUkVUIjoieW91cl9zZWNyZXQiLCJOT1VOX0FQSV9USUVSIjoiRlJFRSJ9fQ==)
[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-0098FF)](https://vscode.dev/redirect/mcp/install?name=noun-project&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40alisaitteke%2Fnoun-mcp%22%5D%2C%22env%22%3A%7B%22NOUN_CONSUMER_KEY%22%3A%22your_key%22%2C%22NOUN_CONSUMER_SECRET%22%3A%22your_secret%22%2C%22NOUN_API_TIER%22%3A%22FREE%22%7D%7D)

Replace `your_key` / `your_secret` with your Consumer Key and Secret after install.

Claude Code:

```bash
claude mcp add \
  --transport stdio \
  noun-project \
  --env NOUN_CONSUMER_KEY=your_key \
  --env NOUN_CONSUMER_SECRET=your_secret \
  --env NOUN_API_TIER=FREE \
  -- npx -y @alisaitteke/noun-mcp
```

Or add this to your MCP client's config (Cursor, Claude Desktop, …):

```json
{
  "mcpServers": {
    "noun-project": {
      "command": "npx",
      "args": ["-y", "@alisaitteke/noun-mcp"],
      "env": {
        "NOUN_CONSUMER_KEY": "your_key",
        "NOUN_CONSUMER_SECRET": "your_secret",
        "NOUN_API_TIER": "FREE"
      }
    }
  }
}
```

Ready-made files: [`examples/cursor-config.json`](examples/cursor-config.json), [`examples/claude-desktop-config.json`](examples/claude-desktop-config.json).

## How it works

1. **You type** what you want in plain language.
2. **The AI searches first** — `search_icons` is a cheap service call and already returns IDs, license, and thumbnails.
3. **Download only when you need a file** — each `download_icon` / `get_icon` spends an icon call.

Hit a quota error? Ask for `check_usage`, then wait or refine. Common fixes: [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Documentation

- [Available tools](docs/available-tools.md) — all 7 tools, parameters, FREE vs PAID
- [Troubleshooting](docs/troubleshooting.md) — keys, 429s, public-domain downloads
- [Architecture](docs/ARCHITECTURE.md) — OAuth, queue, retry, cache
- [Development](docs/development.md) — build from source, tests

## Contributing

Contributions are welcome! Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening a PR.

## Maintainer

Built by **[Ali Sait Teke](https://alisait.com)** — [GitHub](https://github.com/alisaitteke) · [LinkedIn](https://www.linkedin.com/in/alisait/).

## License

MIT
