# Noun MCP

<p align="center">
  <a href="https://github.com/alisaitteke/noun-mcp">
    <img src="./docs/hero.png" alt="Noun MCP — busca y descarga iconos de The Noun Project desde tu asistente de IA" width="100%" />
  </a>
</p>

**Idiomas:** [English](README.md) · [简体中文](README.zh-CN.md) · Español · [Deutsch](README.de.md) · [日本語](README.ja.md) · [Türkçe](README.tr.md)

[![npm version](https://img.shields.io/npm/v/@alisaitteke/noun-mcp.svg)](https://www.npmjs.com/package/@alisaitteke/noun-mcp)
[![GitHub release](https://img.shields.io/github/v/release/alisaitteke/noun-mcp?include_prereleases)](https://github.com/alisaitteke/noun-mcp/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.alisaitteke%2Fnoun--mcp-purple.svg)](https://registry.modelcontextprotocol.io)
[![MCP Toplist](https://mcptoplist.com/badge/io.github.alisaitteke/noun-mcp.svg)](https://mcptoplist.com/server/io.github.alisaitteke/noun-mcp)

[![Noun MCP Server MCP server – quality and maintenance score on Glama](https://glama.ai/mcp/servers/alisaitteke/noun-mcp/badges/card.svg)](https://glama.ai/mcp/servers/alisaitteke/noun-mcp)

**Pide iconos en lenguaje natural.** Describe lo que necesitas — «una taza de café sólida, dominio público» —
y tu asistente de IA busca en The Noun Project, elige una coincidencia y descarga SVG o PNG en
tu proyecto. Funciona con Cursor, Claude Desktop y Claude Code.

> **Nota:** Este es un proyecto no oficial, mantenido por la comunidad, y no está afiliado ni respaldado por The Noun Project.

## ¿Qué puede hacer?

- **Buscar** — filtrar por estilo, grosor de línea y licencia de dominio público
- **Descargar** — SVG o PNG, color y tamaño personalizados, guardado en la ruta que elijas
- **Explorar colecciones** — conjuntos de iconos curados, no solo búsquedas sueltas
- **Autocompletar** — mejores términos de búsqueda antes de gastar cuota
- **Seguir el uso** — ventanas horarias, diarias y mensuales de service vs icon
- **Aguantar en la prueba gratuita** — límites en el cliente para que 150 llamadas icon/mes cundan más

Por debajo: 7 herramientas — lista completa en [`docs/available-tools.md`](docs/available-tools.md).

## Prueba a decir

```
Find solid public-domain coffee cup icons, then download one as a red SVG into ./icons.
```

```
Suggest search terms for "spo", then search weather collections.
```

```
How many Noun Project API calls have I used this month?
```

## Empezar

Necesitas **Node.js 18+** y **claves de API de The Noun Project** ([crea una app](https://thenounproject.com/developers/apps/) — vale una cuenta gratuita). Pon `NOUN_API_TIER` en `FREE` (2.000 llamadas service / 150 icon al mes) o `PAID`. Detalles de cuota: [`docs/available-tools.md`](docs/available-tools.md#free-vs-paid).

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=noun-project&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBhbGlzYWl0dGVrZS9ub3VuLW1jcCJdLCJlbnYiOnsiTk9VTl9DT05TVU1FUl9LRVkiOiJ5b3VyX2tleSIsIk5PVU5fQ09OU1VNRVJfU0VDUkVUIjoieW91cl9zZWNyZXQiLCJOT1VOX0FQSV9USUVSIjoiRlJFRSJ9fQ==)
[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-0098FF)](https://vscode.dev/redirect/mcp/install?name=noun-project&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40alisaitteke%2Fnoun-mcp%22%5D%2C%22env%22%3A%7B%22NOUN_CONSUMER_KEY%22%3A%22your_key%22%2C%22NOUN_CONSUMER_SECRET%22%3A%22your_secret%22%2C%22NOUN_API_TIER%22%3A%22FREE%22%7D%7D)

Tras instalar, sustituye `your_key` / `your_secret` por tu Consumer Key y Secret.

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

O añade esto a la configuración de tu cliente MCP (Cursor, Claude Desktop, …):

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

Archivos listos: [`examples/cursor-config.json`](examples/cursor-config.json), [`examples/claude-desktop-config.json`](examples/claude-desktop-config.json).

## Cómo funciona

1. **Escribes** lo que quieres en lenguaje natural.
2. **La IA busca primero** — `search_icons` es una llamada service barata y ya devuelve IDs, licencia y miniaturas.
3. **Descarga solo cuando necesites un archivo** — cada `download_icon` / `get_icon` gasta una llamada icon.

¿Error de cuota? Pide `check_usage` y espera o afina la búsqueda. Soluciones habituales: [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Documentación

- [Herramientas disponibles](docs/available-tools.md) — las 7 herramientas, parámetros, FREE vs PAID
- [Solución de problemas](docs/troubleshooting.md) — claves, 429, descargas de dominio público
- [Arquitectura](docs/ARCHITECTURE.md) — OAuth, cola, reintentos, caché
- [Desarrollo](docs/development.md) — compilar desde el código fuente, tests

## Contribuir

¡Las contribuciones son bienvenidas! Lee [CONTRIBUTING.md](CONTRIBUTING.md) antes de abrir un PR.

## Responsable

Creado por **[Ali Sait Teke](https://alisait.com)** — [GitHub](https://github.com/alisaitteke) · [LinkedIn](https://www.linkedin.com/in/alisait/).

## Licencia

MIT
