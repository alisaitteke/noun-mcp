# Noun MCP

<p align="center">
  <a href="https://github.com/alisaitteke/noun-mcp">
    <img src="./docs/hero.png" alt="Noun MCP — 用 AI 助手搜索并下载 The Noun Project 图标" width="100%" />
  </a>
</p>

**语言：** [English](README.md) · 简体中文 · [Español](README.es.md) · [Deutsch](README.de.md) · [日本語](README.ja.md) · [Türkçe](README.tr.md)

[![npm version](https://img.shields.io/npm/v/@alisaitteke/noun-mcp.svg)](https://www.npmjs.com/package/@alisaitteke/noun-mcp)
[![GitHub release](https://img.shields.io/github/v/release/alisaitteke/noun-mcp?include_prereleases)](https://github.com/alisaitteke/noun-mcp/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.alisaitteke%2Fnoun--mcp-purple.svg)](https://registry.modelcontextprotocol.io)
[![MCP Toplist](https://mcptoplist.com/badge/io.github.alisaitteke/noun-mcp.svg)](https://mcptoplist.com/server/io.github.alisaitteke/noun-mcp)

[![Noun MCP Server MCP server – quality and maintenance score on Glama](https://glama.ai/mcp/servers/alisaitteke/noun-mcp/badges/card.svg)](https://glama.ai/mcp/servers/alisaitteke/noun-mcp)

**用自然语言要图标。** 说出你需要什么——“实心咖啡杯，公有领域”——AI 助手会在 The Noun Project
中搜索、挑选匹配项，并把 SVG 或 PNG 下载到你的项目里。支持 Cursor、Claude Desktop 和 Claude Code。

> **注意：** 这是一个非官方的社区维护项目，与 The Noun Project 无任何关联，亦未获其背书。

## 能做什么？

- **搜索** — 按风格、线宽和公有领域许可筛选
- **下载** — SVG 或 PNG，自定义颜色和尺寸，保存到指定路径
- **浏览合集** — 精选图标集，不只是单次搜索
- **自动补全** — 在消耗配额前获得更好的搜索词
- **用量跟踪** — 按小时 / 日 / 月查看 service 与 icon 窗口
- **守住免费试用** — 客户端限额，让每月 150 次 icon 调用更耐用

底层：7 个工具 — 完整列表见 [`docs/available-tools.md`](docs/available-tools.md)。

## 可以这样说

```
Find solid public-domain coffee cup icons, then download one as a red SVG into ./icons.
```

```
Suggest search terms for "spo", then search weather collections.
```

```
How many Noun Project API calls have I used this month?
```

## 开始使用

你需要 **Node.js 18+** 和 **Noun Project API 密钥**（[创建应用](https://thenounproject.com/developers/apps/) — 免费账号即可）。将 `NOUN_API_TIER` 设为 `FREE`（每月 2,000 次 service / 150 次 icon 调用）或 `PAID`。配额详情：[`docs/available-tools.md`](docs/available-tools.md#free-vs-paid)。

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=noun-project&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBhbGlzYWl0dGVrZS9ub3VuLW1jcCJdLCJlbnYiOnsiTk9VTl9DT05TVU1FUl9LRVkiOiJ5b3VyX2tleSIsIk5PVU5fQ09OU1VNRVJfU0VDUkVUIjoieW91cl9zZWNyZXQiLCJOT1VOX0FQSV9USUVSIjoiRlJFRSJ9fQ==)
[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-0098FF)](https://vscode.dev/redirect/mcp/install?name=noun-project&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40alisaitteke%2Fnoun-mcp%22%5D%2C%22env%22%3A%7B%22NOUN_CONSUMER_KEY%22%3A%22your_key%22%2C%22NOUN_CONSUMER_SECRET%22%3A%22your_secret%22%2C%22NOUN_API_TIER%22%3A%22FREE%22%7D%7D)

安装后把 `your_key` / `your_secret` 换成你的 Consumer Key 和 Secret。

Claude Code：

```bash
claude mcp add \
  --transport stdio \
  noun-project \
  --env NOUN_CONSUMER_KEY=your_key \
  --env NOUN_CONSUMER_SECRET=your_secret \
  --env NOUN_API_TIER=FREE \
  -- npx -y @alisaitteke/noun-mcp
```

或将以下内容加入 MCP 客户端配置（Cursor、Claude Desktop 等）：

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

现成文件：[`examples/cursor-config.json`](examples/cursor-config.json)、[`examples/claude-desktop-config.json`](examples/claude-desktop-config.json)。

## 工作原理

1. **你用自然语言描述** 想要的图标。
2. **AI 先搜索** — `search_icons` 是廉价的 service 调用，已返回 ID、许可和缩略图。
3. **需要文件时才下载** — 每次 `download_icon` / `get_icon` 都会消耗一次 icon 调用。

碰到配额错误？让助手调用 `check_usage`，然后等待或缩小范围。常见修复：[`docs/troubleshooting.md`](docs/troubleshooting.md)。

## 文档

- [可用工具](docs/available-tools.md) — 全部 7 个工具、参数、FREE vs PAID
- [故障排除](docs/troubleshooting.md) — 密钥、429、公有领域下载
- [架构](docs/ARCHITECTURE.md) — OAuth、队列、重试、缓存
- [开发](docs/development.md) — 源码构建与测试

## 贡献

欢迎贡献！提交 PR 前请阅读 [CONTRIBUTING.md](CONTRIBUTING.md)。

## 维护者

由 **[Ali Sait Teke](https://alisait.com)** 构建 — [GitHub](https://github.com/alisaitteke) · [LinkedIn](https://www.linkedin.com/in/alisait/)。

## 许可证

MIT
