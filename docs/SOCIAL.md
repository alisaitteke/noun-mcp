# Social Sharing Guide

How to share **Noun MCP Server** on LinkedIn, GitHub, and other channels — with the right visuals and copy.

## Assets

| File | Size | Use for |
| --- | --- | --- |
| [`og-github.png`](og-github.png) | 1280×640 | GitHub repo social preview |
| [`og-linkedin.png`](og-linkedin.png) | 1200×627 | LinkedIn image posts, personal site embeds |
| [`og-github.svg`](og-github.svg) | — | Editable source (regenerate PNGs below) |
| [`og-linkedin.svg`](og-linkedin.svg) | — | Editable source (regenerate PNGs below) |
| [`hero.png`](hero.png) | — | README header |

**Regenerate PNGs** after editing SVG sources:

```bash
npm run generate:og
```

## GitHub Social Preview (one-time setup)

1. Open [github.com/alisaitteke/noun-mcp](https://github.com/alisaitteke/noun-mcp) → **Settings** → **General**
2. Scroll to **Social preview**
3. Upload `docs/og-github.png`
4. Save

When anyone shares the repo URL on LinkedIn, Slack, or X, GitHub serves this image in the link preview.

## Recommended GitHub Topics

Add under repo **About** → **Topics**:

```
mcp
model-context-protocol
typescript
cursor
claude
icons
developer-tools
oauth
open-source
ai-tools
```

## LinkedIn — Image Post (recommended)

Attach `docs/og-linkedin.png` and use copy like:

```
Shipped: Noun MCP Server — search & download 5M+ icons from The Noun Project
directly inside Cursor and Claude via Model Context Protocol.

Built with TypeScript, OAuth 1.0a, rate limiting, and a FREE-tier cost optimizer
so hobbyists don't burn their trial service/icon quotas on day one.

Part of my open-source MCP tooling work (Docker, Temporal, Photoshop, npm…).
Architecture write-up in the repo.

🔗 github.com/alisaitteke/noun-mcp
📦 npm: @alisaitteke/noun-mcp
```

## LinkedIn — Link Post

Paste the GitHub repo URL after uploading the GitHub social preview. LinkedIn will pull GitHub's OG image automatically.

Optional first comment with install snippet:

```
npx -y @alisaitteke/noun-mcp
# Requires NOUN_CONSUMER_KEY + NOUN_CONSUMER_SECRET from thenounproject.com/developers
```

## X / Twitter

Short version:

```
Noun MCP Server — search & download icons from @nounproject inside @cursor_ai and Claude.

TypeScript · OAuth 1.0a · FREE-tier cost optimizer

npm i -g @alisaitteke/noun-mcp (or npx)

github.com/alisaitteke/noun-mcp
```

Attach `og-github.png` or `og-linkedin.png` for higher engagement.

## Personal Site

The project is listed at [alisait.com/projects](https://alisait.com/projects). When updating that page, link to:

- Repo: `https://github.com/alisaitteke/noun-mcp`
- Architecture: `https://github.com/alisaitteke/noun-mcp/blob/main/docs/ARCHITECTURE.md`
- npm: `https://www.npmjs.com/package/@alisaitteke/noun-mcp`

## Verification Checklist

- [ ] GitHub social preview uploaded (`og-github.png`)
- [ ] GitHub topics added
- [ ] LinkedIn post published with `og-linkedin.png` or repo link
- [ ] [LinkedIn Post Inspector](https://www.linkedin.com/post-inspector/) — paste repo URL to refresh cache if preview is stale
