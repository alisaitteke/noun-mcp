# Development

Build, test, and run the noun-mcp server locally.

← Back to [README](../README.md)

### From source

```bash
git clone https://github.com/alisaitteke/noun-mcp.git
cd noun-mcp
npm install
cp .env.example .env
```

Put your Noun Project credentials in `.env`, then:

```bash
npm run build
```

### Watch mode

```bash
npm run dev
```

### Test

```bash
npm test
```

### Run the built server

```bash
npm start
```

### Pack integrity

```bash
npm run verify:pack
```

Requires a current `npm run build`. Confirms packed ESM imports resolve without running `npm pack`.

### Project structure

```
noun-mcp/
├── src/
│   ├── index.ts              # MCP server entry point
│   ├── api/
│   │   ├── auth.ts           # OAuth 1.0a authentication
│   │   ├── client.ts         # API client (queue, retry, cache)
│   │   ├── errors.ts         # ApiError + retry policy
│   │   ├── query.ts          # Request query helpers
│   │   ├── usage.ts          # Quota snapshot (legacy + v2)
│   │   └── cache.ts          # GET LRU cache
│   ├── tools/
│   │   ├── search.ts         # Icon search
│   │   ├── download.ts       # Icon download & details
│   │   ├── collections.ts    # Collections & autocomplete
│   │   └── usage.ts          # Usage monitoring
│   ├── types/
│   │   └── schemas.ts        # Zod schemas & TypeScript types
│   └── utils/
│       └── costOptimizer.ts  # FREE-tier cost guards
├── docs/
│   ├── ARCHITECTURE.md       # System design
│   ├── available-tools.md    # Tool reference
│   ├── troubleshooting.md
│   └── SOCIAL.md             # Sharing guide
├── examples/
│   ├── cursor-config.json
│   └── claude-desktop-config.json
├── package.json
└── README.md
```

System design, data flow, and design decisions: **[ARCHITECTURE.md](ARCHITECTURE.md)**.

Release and PR workflow: **[CONTRIBUTING.md](../CONTRIBUTING.md)**.
