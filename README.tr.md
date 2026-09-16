# Noun MCP

<p align="center">
  <a href="https://github.com/alisaitteke/noun-mcp">
    <img src="./docs/hero.png" alt="Noun MCP — AI asistanından The Noun Project ikonlarını ara ve indir" width="100%" />
  </a>
</p>

**Diller:** [English](README.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · Türkçe

[![npm version](https://img.shields.io/npm/v/@alisaitteke/noun-mcp.svg)](https://www.npmjs.com/package/@alisaitteke/noun-mcp)
[![GitHub release](https://img.shields.io/github/v/release/alisaitteke/noun-mcp?include_prereleases)](https://github.com/alisaitteke/noun-mcp/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.alisaitteke%2Fnoun--mcp-purple.svg)](https://registry.modelcontextprotocol.io)
[![MCP Toplist](https://mcptoplist.com/badge/io.github.alisaitteke/noun-mcp.svg)](https://mcptoplist.com/server/io.github.alisaitteke/noun-mcp)

[![Noun MCP Server MCP server – quality and maintenance score on Glama](https://glama.ai/mcp/servers/alisaitteke/noun-mcp/badges/card.svg)](https://glama.ai/mcp/servers/alisaitteke/noun-mcp)

**İkonları düz Türkçe iste.** Ne lazımsa söyle — “düz dolgulu kahve fincanı, kamu malı” —
yapay zeka asistanın The Noun Project’te arar, bir eşleşme seçer ve SVG veya PNG’yi
projenine indirir. Cursor, Claude Desktop ve Claude Code ile çalışır.

> **Not:** Bu, resmi olmayan, topluluk tarafından sürdürülen bir projedir; The Noun Project ile bağlantılı değildir ve The Noun Project tarafından desteklenmemektedir.

## Ne yapabilir?

- **Ara** — stile, çizgi kalınlığına ve kamu malı lisansına göre süz
- **İndir** — SVG veya PNG, özel renk ve boyut, seçtiğin yola kaydet
- **Koleksiyonlara bak** — tek tek arama değil, küratörlü ikon setleri
- **Otomatik tamamlama** — kotayı yakmadan daha iyi arama terimleri
- **Kullanımı izle** — saatlik, günlük ve aylık service / icon pencereleri
- **Ücretsiz denemede kal** — istemci tarafı sınırlar, ayda 150 icon çağrısının yetmesini sağlar

Kaputun altında: 7 araç — tam liste [`docs/available-tools.md`](docs/available-tools.md).

## Şunu dene

```
Find solid public-domain coffee cup icons, then download one as a red SVG into ./icons.
```

```
Suggest search terms for "spo", then search weather collections.
```

```
How many Noun Project API calls have I used this month?
```

## Başla

**Node.js 18+** ve **Noun Project API anahtarları** gerekir ([bir uygulama oluştur](https://thenounproject.com/developers/apps/) — ücretsiz hesap yeter). `NOUN_API_TIER` değerini `FREE` (ayda 2.000 service / 150 icon çağrısı) veya `PAID` yap. Kota ayrıntıları: [`docs/available-tools.md`](docs/available-tools.md#free-vs-paid).

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=noun-project&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBhbGlzYWl0dGVrZS9ub3VuLW1jcCJdLCJlbnYiOnsiTk9VTl9DT05TVU1FUl9LRVkiOiJ5b3VyX2tleSIsIk5PVU5fQ09OU1VNRVJfU0VDUkVUIjoieW91cl9zZWNyZXQiLCJOT1VOX0FQSV9USUVSIjoiRlJFRSJ9fQ==)
[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-0098FF)](https://vscode.dev/redirect/mcp/install?name=noun-project&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40alisaitteke%2Fnoun-mcp%22%5D%2C%22env%22%3A%7B%22NOUN_CONSUMER_KEY%22%3A%22your_key%22%2C%22NOUN_CONSUMER_SECRET%22%3A%22your_secret%22%2C%22NOUN_API_TIER%22%3A%22FREE%22%7D%7D)

Kurulumdan sonra `your_key` / `your_secret` yerine Consumer Key ve Secret’ını yaz.

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

Veya MCP istemcinin yapılandırmasına ekle (Cursor, Claude Desktop, …):

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

Hazır dosyalar: [`examples/cursor-config.json`](examples/cursor-config.json), [`examples/claude-desktop-config.json`](examples/claude-desktop-config.json).

## Nasıl çalışır

1. **Sen yazarsın** — ne istediğini düz dille.
2. **AI önce arar** — `search_icons` ucuz bir service çağrısıdır ve zaten ID, lisans ve küçük resmi döner.
3. **Dosya gerektiğinde indir** — her `download_icon` / `get_icon` bir icon çağrısı harcar.

Kota hatası mı? `check_usage` iste, sonra bekle veya aramayı daralt. Sık düzeltmeler: [`docs/troubleshooting.md`](docs/troubleshooting.md).

## Belgeler

- [Kullanılabilir araçlar](docs/available-tools.md) — 7 aracın tümü, parametreler, FREE vs PAID
- [Sorun giderme](docs/troubleshooting.md) — anahtarlar, 429, kamu malı indirmeler
- [Mimari](docs/ARCHITECTURE.md) — OAuth, kuyruk, yeniden deneme, önbellek
- [Geliştirme](docs/development.md) — kaynaktan derleme, testler

## Katkı

Katkılar memnuniyetle karşılanır. PR açmadan önce [CONTRIBUTING.md](CONTRIBUTING.md) dosyasını oku.

## Sürdüren

**[Ali Sait Teke](https://alisait.com)** tarafından yapıldı — [GitHub](https://github.com/alisaitteke) · [LinkedIn](https://www.linkedin.com/in/alisait/).

## Lisans

MIT
