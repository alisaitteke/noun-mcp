# Noun MCP

<p align="center">
  <a href="https://github.com/alisaitteke/noun-mcp">
    <img src="./docs/hero.png" alt="Noun MCP — AI アシスタントから The Noun Project のアイコンを検索・ダウンロード" width="100%" />
  </a>
</p>

**言語：** [English](README.md) · [简体中文](README.zh-CN.md) · [Español](README.es.md) · [Deutsch](README.de.md) · 日本語 · [Türkçe](README.tr.md)

[![npm version](https://img.shields.io/npm/v/@alisaitteke/noun-mcp.svg)](https://www.npmjs.com/package/@alisaitteke/noun-mcp)
[![GitHub release](https://img.shields.io/github/v/release/alisaitteke/noun-mcp?include_prereleases)](https://github.com/alisaitteke/noun-mcp/releases)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6-blue.svg)](https://www.typescriptlang.org/)
[![Node.js](https://img.shields.io/badge/node-%3E%3D18-brightgreen.svg)](https://nodejs.org/)
[![MCP Registry](https://img.shields.io/badge/MCP%20Registry-io.github.alisaitteke%2Fnoun--mcp-purple.svg)](https://registry.modelcontextprotocol.io)
[![MCP Toplist](https://mcptoplist.com/badge/io.github.alisaitteke/noun-mcp.svg)](https://mcptoplist.com/server/io.github.alisaitteke/noun-mcp)

[![Noun MCP Server MCP server – quality and maintenance score on Glama](https://glama.ai/mcp/servers/alisaitteke/noun-mcp/badges/card.svg)](https://glama.ai/mcp/servers/alisaitteke/noun-mcp)

**普通の言葉でアイコンを頼む。** 欲しいものを伝えるだけ — 「塗りつぶしのコーヒーカップ、パブリックドメイン」—
AI アシスタントが The Noun Project を検索し、候補を選び、SVG または PNG をプロジェクトへダウンロードします。
Cursor、Claude Desktop、Claude Code で動作します。

> **注記:** これは非公式のコミュニティ保守プロジェクトであり、The Noun Project とは提携しておらず、承認も受けていません。

## できること

- **検索** — スタイル、線の太さ、パブリックドメインのライセンスで絞り込み
- **ダウンロード** — SVG または PNG、任意の色とサイズ、指定パスへ保存
- **コレクション閲覧** — 単発検索だけでなく、キュレーション済みセット
- **オートコンプリート** — クォータを使う前により良い検索語を取得
- **使用量の確認** — 時間 / 日 / 月の service と icon ウィンドウ
- **無料トライアルを守る** — クライアント側の上限で、月 150 回の icon 呼び出しを長持ちさせる

内部は 7 つのツール — 一覧は [`docs/available-tools.md`](docs/available-tools.md)。

## こう言ってみて

```
Find solid public-domain coffee cup icons, then download one as a red SVG into ./icons.
```

```
Suggest search terms for "spo", then search weather collections.
```

```
How many Noun Project API calls have I used this month?
```

## はじめ方

必要なものは **Node.js 18+** と **Noun Project API キー**（[アプリを作成](https://thenounproject.com/developers/apps/) — 無料アカウントで可）。`NOUN_API_TIER` を `FREE`（月 2,000 service / 150 icon 呼び出し）または `PAID` に設定。クォータの詳細: [`docs/available-tools.md`](docs/available-tools.md#free-vs-paid)。

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=noun-project&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIkBhbGlzYWl0dGVrZS9ub3VuLW1jcCJdLCJlbnYiOnsiTk9VTl9DT05TVU1FUl9LRVkiOiJ5b3VyX2tleSIsIk5PVU5fQ09OU1VNRVJfU0VDUkVUIjoieW91cl9zZWNyZXQiLCJOT1VOX0FQSV9USUVSIjoiRlJFRSJ9fQ==)
[![Install in VS Code](https://img.shields.io/badge/Install%20in-VS%20Code-0098FF)](https://vscode.dev/redirect/mcp/install?name=noun-project&config=%7B%22command%22%3A%22npx%22%2C%22args%22%3A%5B%22-y%22%2C%22%40alisaitteke%2Fnoun-mcp%22%5D%2C%22env%22%3A%7B%22NOUN_CONSUMER_KEY%22%3A%22your_key%22%2C%22NOUN_CONSUMER_SECRET%22%3A%22your_secret%22%2C%22NOUN_API_TIER%22%3A%22FREE%22%7D%7D)

インストール後、`your_key` / `your_secret` を Consumer Key と Secret に置き換えてください。

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

または MCP クライアントの設定に追加（Cursor、Claude Desktop など）:

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

用意済みファイル: [`examples/cursor-config.json`](examples/cursor-config.json)、[`examples/claude-desktop-config.json`](examples/claude-desktop-config.json)。

## 仕組み

1. **あなたが** 欲しいものを普通の言葉で書く。
2. **AI が先に検索する** — `search_icons` は安い service 呼び出しで、すでに ID・ライセンス・サムネイルを返す。
3. **ファイルが必要なときだけダウンロード** — `download_icon` / `get_icon` は毎回 icon 呼び出しを消費する。

クォータエラーが出たら `check_usage` を実行し、待つか検索を絞る。よくある対処: [`docs/troubleshooting.md`](docs/troubleshooting.md)。

## ドキュメント

- [利用可能なツール](docs/available-tools.md) — 全 7 ツール、パラメータ、FREE vs PAID
- [トラブルシューティング](docs/troubleshooting.md) — キー、429、パブリックドメインのダウンロード
- [アーキテクチャ](docs/ARCHITECTURE.md) — OAuth、キュー、リトライ、キャッシュ
- [開発](docs/development.md) — ソースからのビルドとテスト

## コントリビューション

貢献を歓迎します。PR を開く前に [CONTRIBUTING.md](CONTRIBUTING.md) を読んでください。

## メンテナ

**[Ali Sait Teke](https://alisait.com)** が構築 — [GitHub](https://github.com/alisaitteke) · [LinkedIn](https://www.linkedin.com/in/alisait/)。

## ライセンス

MIT
