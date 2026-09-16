# Noun MCP

<p align="center">
  <a href="https://github.com/alisaitteke/noun-mcp">
    <img src="./docs/hero.png" alt="Noun MCP — The-Noun-Project-Icons per KI-Assistent suchen und herunterladen" width="100%" />
  </a>
</p>

**Sprachen:** [English](README.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md) · Deutsch · [日本語](README.ja.md) · [Türkçe](README.tr.md)

[![npm version](https://img.shields.io/npm/v/@alisaitteke/noun-mcp.svg)](https://www.npmjs.com/package/@alisaitteke/noun-mcp)
[![GitHub release](https://img.shields.io/github/v/release/alisaitteke/noun-mcp?include_prereleases)](https://github.com/alisaitteke/noun-mcp/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.alisaitteke%2Fnoun--mcp-purple.svg)](https://registry.modelcontextprotocol.io)
[![MCP Toplist](https://mcptoplist.com/badge/io.github.alisaitteke/noun-mcp.svg)](https://mcptoplist.com/server/io.github.alisaitteke/noun-mcp)

[![Noun MCP Server MCP server – quality and maintenance score on Glama](https://glama.ai/mcp/servers/alisaitteke/noun-mcp/badges/card.svg)](https://glama.ai/mcp/servers/alisaitteke/noun-mcp)

**Icons in Alltagssprache anfordern.** Beschreibe, was du brauchst — „eine flächige Kaffeetasse, Public Domain“ —
und dein KI-Assistent durchsucht The Noun Project, wählt einen Treffer und lädt SVG oder PNG in
dein Projekt. Funktioniert mit Cursor, Claude Desktop und Claude Code.

> **Hinweis:** Dies ist ein inoffizielles, von der Community gepflegtes Projekt und steht in keiner Verbindung zu The Noun Project und wird von The Noun Project nicht unterstützt.

## Was kann es?

- **Suchen** — nach Stil, Strichstärke und Public-Domain-Lizenz filtern
- **Herunterladen** — SVG oder PNG, eigene Farbe und Größe, gespeichert unter dem Pfad deiner Wahl
- **Sammlungen durchstöbern** — kuratierte Icon-Sets, nicht nur Einzeltreffer
- **Autovervollständigung** — bessere Suchbegriffe, bevor Kontingent verbraucht wird
- **Nutzung verfolgen** — stündliche, tägliche und monatliche Service- vs. Icon-Fenster
- **Im Free-Trial bleiben** — clientseitige Limits, damit 150 Icon-Aufrufe/Monat länger reichen

Unter der Haube: 7 Tools — vollständige Liste in [`docs/available-tools.md`](docs/available-tools.md).

## Probier das hier

```
Find solid public-domain coffee cup icons, then download one as a red SVG into ./icons.
```

```
Suggest search terms for "spo", then search weather collections.
```

```
How many Noun Project API calls have I used this month?
```

## Loslegen

Du brauchst **Node.js 18+** und **Noun-Project-API-Schlüssel** ([App anlegen](https://thenounproject.com/developers/apps/) — ein kostenloses Konto reicht). Setze `NOUN_API_TIER` auf `FREE` (2.000 Service- / 150 Icon-Aufrufe pro Monat) oder `PAID`. Kontingentdetails: [`docs/available-tools.md`](docs/available-tools.md#free-vs-paid).

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=noun-project&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBhbGlzYWl0dGVrZS9ub3VuLW1jcCJdLCJlbnYiOnsiTk9VTl9DT05TVU1FUl9LRVkiOiJ5b3VyX2tleSIsIk5PVU5fQ09OU1VNRVJfU0VDUkVUIjoieW91cl9zZWNyZXQiLCJOT1VOX0FQSV9USUVSIjoiRlJFRSJ9fQ==)
[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-0098FF)](https://vscode.dev/redirect/mcp/install?name=noun-project&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40alisaitteke%2Fnoun-mcp%22%5D%2C%22env%22%3A%7B%22NOUN_CONSUMER_KEY%22%3A%22your_key%22%2C%22NOUN_CONSUMER_SECRET%22%3A%22your_secret%22%2C%22NOUN_API_TIER%22%3A%22FREE%22%7D%7D)

Ersetze nach der Installation `your_key` / `your_secret` durch deinen Consumer Key und Secret.

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

Oder füge dies zur MCP-Client-Konfiguration hinzu (Cursor, Claude Desktop, …):

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

Fertige Dateien: [`examples/cursor-config.json`](examples/cursor-config.json), [`examples/claude-desktop-config.json`](examples/claude-desktop-config.json).

## So funktioniert es

1. **Du schreibst** in Alltagssprache, was du willst.
2. **Die KI sucht zuerst** — `search_icons` ist ein günstiger Service-Aufruf und liefert bereits IDs, Lizenz und Thumbnails.
3. **Nur herunterladen, wenn du eine Datei brauchst** — jeder `download_icon` / `get_icon` verbraucht einen Icon-Aufruf.

Kontingentfehler? Lass `check_usage` laufen, dann warten oder die Suche verfeinern. Häufige Fixes: [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Dokumentation

- [Verfügbare Tools](docs/available-tools.md) — alle 7 Tools, Parameter, FREE vs PAID
- [Fehlerbehebung](docs/troubleshooting.md) — Schlüssel, 429er, Public-Domain-Downloads
- [Architektur](docs/ARCHITECTURE.md) — OAuth, Queue, Retry, Cache
- [Entwicklung](docs/development.md) — aus dem Quellcode bauen, Tests

## Mitwirken

Beiträge sind willkommen! Bitte lies [CONTRIBUTING.md](CONTRIBUTING.md), bevor du einen PR öffnest.

## Maintainer

Erstellt von **[Ali Sait Teke](https://alisait.com)** — [GitHub](https://github.com/alisaitteke) · [LinkedIn](https://www.linkedin.com/in/alisait/).

## Lizenz

MIT
