<div align="center">

![Noun MCP Server](docs/hero.png)

# <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/palette-white.svg"><img src="docs/icons/palette.svg" width="32" height="32" alt="Palette"></picture> Noun MCP Server

[![npm version](https://badge.fury.io/js/@alisaitteke%2Fnoun-mcp.svg)](https://www.npmjs.com/package/@alisaitteke/noun-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen)](https://nodejs.org/)

> **⚠️ Unofficial Project** · This is an independent third-party tool using The Noun Project API. Not affiliated with or endorsed by The Noun Project.

MCP (Model Context Protocol) server for searching, downloading, and using icons from The Noun Project in **Cursor AI**, **Claude Desktop**, and other MCP-supported AI tools.

TypeScript · OAuth 1.0a · tier-aware API cost optimization · production-ready MCP tooling

</div>

---

### 🚀 Quick Start

<table>
<tr>
<td width="33%">

**Cursor AI**

Add to MCP settings:

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

</td>
<td width="33%">

**Claude Desktop**

Add to config:

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

</td>
<td width="33%">

**Claude Code**

Run in terminal:

```bash
claude mcp add \
  --transport stdio \
  noun-project \
  --env NOUN_CONSUMER_KEY=your_key \
  --env NOUN_CONSUMER_SECRET=your_secret \
  --env NOUN_API_TIER=FREE \
  -- npx -y @alisaitteke/noun-mcp
```

</td>
</tr>
</table>

[Get your API keys →](https://thenounproject.com/developers/apps/)

> **What is this?** A bridge that lets AI assistants search and download professional icons for your projects. No manual browsing needed - just ask your AI!

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/star-white.svg"><img src="docs/icons/star.svg" width="24" height="24" alt="Features"></picture> Features


- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/search-white.svg"><img src="docs/icons/search.svg" width="20" height="20" alt="Search"></picture> **Icon Search**: Find icons with filters for style, line weight, and licensing
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/download-white.svg"><img src="docs/icons/download.svg" width="20" height="20" alt="Download"></picture> **Icon Download**: Get SVG or PNG files with custom colors and sizes
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/book-white.svg"><img src="docs/icons/book.svg" width="20" height="20" alt="Collection"></picture> **Collection Browser**: Explore curated icon collections
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/lightbulb-white.svg"><img src="docs/icons/lightbulb.svg" width="20" height="20" alt="Idea"></picture> **Smart Suggestions**: Autocomplete helps find the right search terms
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/chart-white.svg"><img src="docs/icons/chart.svg" width="20" height="20" alt="Chart"></picture> **Usage Tracking**: Monitor your API usage and limits
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/free-white.svg"><img src="docs/icons/free.svg" width="20" height="20" alt="Free"></picture> **FREE Tier Mode**: Smart optimizations for trial quotas (2,000 service / 150 icon calls per month)
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/diamond-white.svg"><img src="docs/icons/diamond.svg" width="20" height="20" alt="Diamond"></picture> **PAID Tier Mode**: Pay-Per-Use limits with fewer client-side caps

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/package-white.svg"><img src="docs/icons/package.svg" width="24" height="24" alt="Builder"></picture> About the Builder

Built by **[Ali Sait Teke](https://alisait.com)** — Full-Stack / AI-Era Software Architect based in London.

This project is part of an open-source [MCP tooling ecosystem](https://alisait.com/projects) (Docker, Temporal, Photoshop, npm, and more) that brings real-world APIs into AI-assisted development workflows. Implemented in **TypeScript/Node.js**; broader portfolio spans **Python**, **Go**, **React**, **Next.js**, and **Vue**.

- GitHub: [@alisaitteke](https://github.com/alisaitteke)
- LinkedIn: [Ali Sait Teke](https://www.linkedin.com/in/alisait/)
- Portfolio: [alisait.com](https://alisait.com)

**Architecture deep-dive:** [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) · **Sharing guide:** [docs/SOCIAL.md](docs/SOCIAL.md)

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checklist-white.svg"><img src="docs/icons/checklist.svg" width="24" height="24" alt="Requirements"></picture> Requirements

- **Node.js** 18 or higher ([Download](https://nodejs.org/))
- **The Noun Project API Keys** (free account works!)

Don't have API keys? [Get them here →](https://thenounproject.com/developers/apps/)

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/rocket-white.svg"><img src="docs/icons/rocket.svg" width="24" height="24" alt="Quick Start"></picture> Quick Start

### <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/key-white.svg"><img src="docs/icons/key.svg" width="20" height="20" alt="1"></picture> Step 1: Get Your API Keys

1. Go to [The Noun Project Developers](https://thenounproject.com/developers/apps/)
2. Sign in or create a free account
3. Create a new app (or select an existing one)
4. Copy your **Consumer Key** and **Consumer Secret**

### <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/package-white.svg"><img src="docs/icons/package.svg" width="20" height="20" alt="2"></picture> Step 2: Installation

**Option A: npx (Easiest - No Install Required)**

```bash
# Run directly without installation
npx @alisaitteke/noun-mcp
```

**Option B: Global Install**

```bash
npm install -g @alisaitteke/noun-mcp
```

**Option C: Local Development**

```bash
git clone https://github.com/alisaitteke/noun-mcp.git
cd noun-mcp
npm install
npm run build
npm link
```

### <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/gear-white.svg"><img src="docs/icons/gear.svg" width="20" height="20" alt="3"></picture> Step 3: Configure Environment

Create a `.env` file in the project directory:

```bash
cp .env.example .env
```

Edit `.env` with your credentials:

```env
# Your API credentials from The Noun Project
NOUN_CONSUMER_KEY=your_consumer_key_here
NOUN_CONSUMER_SECRET=your_consumer_secret_here

# Choose your tier: FREE (trial quotas) or PAID (Pay-Per-Use)
NOUN_API_TIER=FREE
```

#### <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/free-white.svg"><img src="docs/icons/free.svg" width="20" height="20" alt="FREE"></picture> FREE vs <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/diamond-white.svg"><img src="docs/icons/diamond.svg" width="20" height="20" alt="PAID"></picture> PAID Tier

Noun Project counts two families of calls, each with hourly, daily, and monthly windows. Exceeding any window returns HTTP 429.

- **Service call** — search, collections, autocomplete, usage (no icon ID in the URL)
- **Icon call** — `get_icon`, `download_icon` (any request whose path includes an icon ID)

**FREE Trial**
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> Service: 1,000/day · 2,000/month
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> Icon: 150/day **and** 150/month
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> Smaller page sizes (max 10 results per search)
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> Optimized thumbnails (42px by default)
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> SVG URLs excluded by default
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> Usage alerts plus GET response caching (5 min)

**PAID (Pay-Per-Use)**
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> Service: 200,000/day · 3,000,000/month
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> Icon: 10,000/day · 150,000/month
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> Larger page sizes (up to 100 results)
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> High-quality thumbnails (84px by default)
- <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/checkmark-white.svg"><img src="docs/icons/checkmark.svg" width="16" height="16" alt="✓"></picture> SVG URLs included automatically

<picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/lightbulb-white.svg"><img src="docs/icons/lightbulb.svg" width="20" height="20" alt="Tip"></picture> **Switch anytime:** Just update `NOUN_API_TIER` in your `.env` file!

### <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/desktop-white.svg"><img src="docs/icons/desktop.svg" width="20" height="20" alt="4"></picture> Step 4: Configure Cursor AI

Open Cursor settings: **Settings → Features → MCP**

Add this configuration:

**Option A: Using npx (Recommended)**

```json
{
  "mcpServers": {
    "noun-project": {
      "command": "npx",
      "args": ["@alisaitteke/noun-mcp"],
      "env": {
        "NOUN_CONSUMER_KEY": "your_key_here",
        "NOUN_CONSUMER_SECRET": "your_secret_here",
        "NOUN_API_TIER": "FREE"
      }
    }
  }
}
```

**Option B: Using global install**

```json
{
  "mcpServers": {
    "noun-project": {
      "command": "noun-mcp",
      "env": {
        "NOUN_CONSUMER_KEY": "your_key_here",
        "NOUN_CONSUMER_SECRET": "your_secret_here",
        "NOUN_API_TIER": "FREE"
      }
    }
  }
}
```

**Option C: Using local build**

```json
{
  "mcpServers": {
    "noun-project": {
      "command": "node",
      "args": ["/path/to/noun-mcp/dist/index.js"],
      "env": {
        "NOUN_CONSUMER_KEY": "your_key_here",
        "NOUN_CONSUMER_SECRET": "your_secret_here",
        "NOUN_API_TIER": "FREE"
      }
    }
  }
}
```

### <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/desktop-white.svg"><img src="docs/icons/desktop.svg" width="20" height="20" alt="5"></picture> Step 5: Configure Claude Desktop

Edit: `~/Library/Application Support/Claude/claude_desktop_config.json`

**Using npx (Recommended)**

```json
{
  "mcpServers": {
    "noun-project": {
      "command": "npx",
      "args": ["@alisaitteke/noun-mcp"],
      "env": {
        "NOUN_CONSUMER_KEY": "your_key_here",
        "NOUN_CONSUMER_SECRET": "your_secret_here",
        "NOUN_API_TIER": "FREE"
      }
    }
  }
}
```

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/chat-white.svg"><img src="docs/icons/chat.svg" width="24" height="24" alt="Usage Examples"></picture> Usage Examples

Once configured, just talk to your AI naturally:

### Search for Icons
```
"Find me some coffee cup icons"
"Search for solid style house icons"
"Show me line icons with weight 18-20 for 'bicycle'"
```

### Download Icons
```
"Download icon 12345 in red color"
"Get icon 67890 as PNG, 200x200 pixels, save to ./icons/house.png"
"Download this icon as SVG with hex color FF5733"
```

### Browse Collections
```
"Search for weather icon collections"
"Show me collection 123 details"
```

### Get Suggestions
```
"Give me autocomplete suggestions for 'spo'"
```

### Check Usage
```
"How many API calls have I used this month?"
"Check my API usage limits"
```

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/wrench-white.svg"><img src="docs/icons/wrench.svg" width="24" height="24" alt="Available Tools"></picture> Available Tools

The AI can use these tools to help you:

### `search_icons`
Search The Noun Project icon database.

**What you can filter:**
- **Style**: `solid`, `line`, or both
- **Line weight**: `1-60` or range like `"18-20"`
- **Public domain**: Show only free-to-use icons
- **Thumbnail size**: `42`, `84`, or `200` pixels
- **Include SVG**: Get SVG URLs in results
- **Limit**: Max results per page

**Example:**
```
"Search for 'coffee' icons in solid style, public domain only"
```

### `get_icon`
Get detailed information about a specific icon.

**Returns:**
- Icon name and ID
- Creator information
- Tags and collections
- License details
- Download URLs

**Example:**
```
"Show me details for icon 12345"
```

### `download_icon`
Download an icon with custom options.

**Options:**
- **Format**: SVG or PNG
- **Color**: Any hex color (e.g., "FF0000" for red)
- **Size**: 20-1200 pixels (PNG only)
- **Save to file**: Optional file path

**Note:** FREE tier can only download public domain icons.

**Example:**
```
"Download icon 12345 as PNG, 200x200, red color, save to ./icons/coffee.png"
```

### `search_collections`
Find icon collections by keyword.

**Example:**
```
"Search for 'travel' collections"
```

### `get_collection`
View a specific collection with all its icons.

**Example:**
```
"Show me collection 456"
```

### `icon_autocomplete`
Get search term suggestions (max 10).

**Example:**
```
"What terms start with 'comp'?"
```

### `check_usage`
Check your API usage and limits.

**Shows:**
- Monthly limit and usage
- Remaining calls
- Percentage used
- Days until reset
- Optimization tips (FREE tier)

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/free-white.svg"><img src="docs/icons/free.svg" width="24" height="24" alt="FREE Tier"></picture> FREE Tier Best Practices

Protect the tight **icon-call** cap (150/day):

### 1. Search is enough for browsing
```
search_icons already returns ID, style, license, thumbnail, tags, attribution.
Do not call get_icon for every result — that burns icon quota.
```

### 2. Be Specific
```
Bad:  "icon"       → Too broad, many pages needed
Good: "coffee cup" → Specific, better results
```

### 3. Use Autocomplete First
```
Step 1: "Suggestions for 'cof'"  → ["coffee", "coffee cup"]
Step 2: "Search for 'coffee cup'" → Exact results
```

### 4. Avoid Pagination
```
Bad:  Browsing 5 pages = 5 service calls
Good: Refine search to get results on first page
```

### 5. Download Once, Reuse
```
Download icon → Save to project → Use everywhere
(Don't re-download the same icon; each download is an icon call)
```

### 6. Filter for Public Domain
```
FREE tier can only download public domain icons
Filter searches with limit_to_public_domain=1
```

### 7. Cache Results
The server caches identical GET searches / icon lookups for 5 minutes, and usage data for 5 minutes.
You should also save:
- Downloaded icons
- Icon IDs you've explored
- Collection information

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/chart-white.svg"><img src="docs/icons/chart.svg" width="24" height="24" alt="Cost Optimization"></picture> Cost Optimization

The server automatically optimizes API usage in FREE tier mode:

| Feature | FREE Trial | PAID (Pay-Per-Use) |
|---------|------------|--------------------|
| Service calls | 1,000/day · 2,000/month | 200,000/day · 3,000,000/month |
| Icon calls (`get_icon`, `download_icon`) | 150/day · 150/month | 10,000/day · 150,000/month |
| Results per page | 10 max | 100 max |
| Default thumbnail | 42px | 84px |
| SVG URLs | Excluded | Included |
| GET cache | 5 min | 5 min |
| 429 handling | Retry + Retry-After (capped) | Retry + Retry-After (capped) |

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/wrench-white.svg"><img src="docs/icons/wrench.svg" width="24" height="24" alt="Development"></picture> Development

### Run in Development Mode

```bash
npm install
npm run dev
```

### Test

```bash
npm test
```

### Build for Production

```bash
npm run build
```

### Run Built Version

```bash
npm start
```

### Project Structure

```
noun-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── api/
│   │   ├── auth.ts          # OAuth 1.0a authentication
│   │   ├── client.ts        # API client (queue, retry, cache)
│   │   ├── errors.ts        # ApiError + retry policy
│   │   ├── usage.ts         # Quota snapshot (legacy + v2)
│   │   └── cache.ts         # GET LRU cache
│   ├── tools/
│   │   ├── search.ts        # Icon search functionality
│   │   ├── download.ts      # Icon download & details
│   │   ├── collections.ts   # Collections & autocomplete
│   │   └── usage.ts         # Usage monitoring
│   ├── types/
│   │   └── schemas.ts       # Zod schemas & TypeScript types
│   └── utils/
│       └── costOptimizer.ts # Cost optimization logic
├── docs/
│   ├── ARCHITECTURE.md      # System design & technical overview
│   └── SOCIAL.md            # LinkedIn / GitHub sharing guide
├── package.json
├── tsconfig.json
└── README.md
```

For system design, data flow, and design decisions, see **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)**.

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/bug-white.svg"><img src="docs/icons/bug.svg" width="24" height="24" alt="Troubleshooting"></picture> Troubleshooting

### "Missing required environment variables"

**Problem:** API keys not found.

**Solution:**
1. Check `.env` file exists
2. Verify `NOUN_CONSUMER_KEY` and `NOUN_CONSUMER_SECRET` are set
3. Check for typos in variable names

### "Authentication failed"

**Problem:** Invalid API credentials.

**Solution:**
1. Verify credentials at [developers page](https://thenounproject.com/developers/apps/)
2. Make sure you copied the entire key/secret
3. Check for extra spaces or quotes

### "Rate limit exceeded"

**Problem:** An hourly, daily, or monthly window (service or icon) was exhausted — or requests were sent too fast.

**Solution:**
- Run `check_usage` to see which window is empty
- Stop calling `get_icon` on every search hit (icon quota is the usual culprit on the free trial)
- Wait for the window in the error message to reset
- The server queues requests (one at a time), retries transient 429/5xx with backoff, and caches identical GETs for 5 minutes

### SVG URLs Not Working

**Problem:** SVG URLs expire after 1 hour.

**Solution:**
- Download fresh URLs when needed
- Use `download_icon` to get base64-encoded icons
- Save icons locally instead of relying on URLs

### "Free API access is limited to public domain icons"

**Problem:** Trying to download non-public-domain icon with FREE account.

**Solution:**
- Filter searches: `limit_to_public_domain=1`
- Or upgrade to PAID tier at [pricing page](https://thenounproject.com/pricing)

### Server Not Appearing in Cursor/Claude

**Problem:** MCP server not detected.

**Solution:**
1. Restart Cursor AI or Claude Desktop
2. Check JSON config syntax (no trailing commas!)
3. Verify file paths are absolute
4. Check server logs for errors

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/document-white.svg"><img src="docs/icons/document.svg" width="24" height="24" alt="API Limits"></picture> API Limits

| Tier | Service calls | Icon calls | Download access |
|------|---------------|------------|-----------------|
| FREE trial | 1,000/day · 2,000/month | 150/day · 150/month | Public domain only |
| Pay-Per-Use | 200,000/day · 3,000,000/month | 10,000/day · 150,000/month | All icons |

An **icon call** is any request whose URL includes an icon ID (`get_icon`, `download_icon`). Everything else is a **service call**. All keys also have hourly limits; exceeding any window returns HTTP 429.

**Want more?** Check [The Noun Project API pricing](https://thenounproject.com/api/)

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/handshake-white.svg"><img src="docs/icons/handshake.svg" width="24" height="24" alt="Contributing"></picture> Contributing

Contributions are welcome. See **[CONTRIBUTING.md](CONTRIBUTING.md)** for setup, language policy, and the GitHub Release → npm → MCP Registry publish flow.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/document-white.svg"><img src="docs/icons/document.svg" width="24" height="24" alt="License"></picture> License

MIT License - see [LICENSE](LICENSE) file for details.

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/heart-white.svg"><img src="docs/icons/heart.svg" width="24" height="24" alt="Acknowledgments"></picture> Acknowledgments

- [The Noun Project](https://thenounproject.com/) - For the amazing icon collection
- [Model Context Protocol](https://modelcontextprotocol.io/) - For the MCP specification
- [Anthropic](https://www.anthropic.com/) - For Claude and MCP development

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/package-white.svg"><img src="docs/icons/package.svg" width="24" height="24" alt="Author"></picture> Author

**[Ali Sait Teke](https://alisait.com)** — Full-Stack / AI-Era Software Architect

- GitHub: [@alisaitteke](https://github.com/alisaitteke)
- LinkedIn: [Ali Sait Teke](https://www.linkedin.com/in/alisait/)
- Portfolio: [alisait.com](https://alisait.com)
- NPM: [@alisaitteke](https://www.npmjs.com/~alisaitteke)
- More MCP projects: [alisait.com/projects](https://alisait.com/projects)

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/email-white.svg"><img src="docs/icons/email.svg" width="24" height="24" alt="Support"></picture> Support

- **Issues:** [GitHub Issues](https://github.com/alisaitteke/noun-mcp/issues)
- **Documentation:** [The Noun Project API Docs](https://api.thenounproject.com/documentation.html)
- **Pricing:** [The Noun Project Plans](https://thenounproject.com/pricing)

## <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/link-white.svg"><img src="docs/icons/link.svg" width="24" height="24" alt="Links"></picture> Links

- [The Noun Project](https://thenounproject.com/)
- [The Noun Project API](https://api.thenounproject.com/)
- [MCP Documentation](https://modelcontextprotocol.io/)
- [Cursor AI](https://cursor.sh/)
- [Claude](https://claude.ai/)

---

**Note:** This is a community-built MCP server and is not an official product of The Noun Project.

Made with <picture><source media="(prefers-color-scheme: dark)" srcset="docs/icons/heart-white.svg"><img src="docs/icons/heart.svg" width="16" height="16" alt="love"></picture> for the AI and developer community.
