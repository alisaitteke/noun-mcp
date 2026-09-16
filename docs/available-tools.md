# Available Tools

**7 tools** — icon search, download, collections, autocomplete, and usage.

Reference for all MCP tools exposed by this server (parameters, examples, and FREE vs PAID quotas).

← Back to [README](../README.md)

Noun Project counts two families of calls. Exceeding any hourly, daily, or monthly window returns HTTP 429.

- **Service call** — `search_icons`, `search_collections`, `get_collection`, `icon_autocomplete`, `check_usage` (no icon ID in the URL)
- **Icon call** — `get_icon`, `download_icon` (any request whose path includes an icon ID)

### `search_icons`

Search The Noun Project icon database. Cheap **service** call — do not follow up with `get_icon` for every result.

**Parameters:**
- `query` (string, required): Search term (e.g. `"dog"`, `"house"`, `"bicycle"`)
- `styles` (string, optional): `solid`, `line`, or `solid,line`
- `line_weight` (number or string, optional): `1–60` or a range like `"18-20"`
- `limit_to_public_domain` (number, optional): `1` = public domain only, `0` = all
- `thumbnail_size` (number, optional): `42`, `84`, or `200` pixels
- `include_svg` (number, optional): `1` = include SVG URLs, `0` = omit
- `limit` (number, optional): Max results per page
- `next_page` / `prev_page` (string, optional): Pagination tokens

**Example:**
```
Search for 'coffee' icons in solid style, public domain only
```

### `get_icon`

Get extra details for one icon, including a temporary SVG `icon_url` (expires in 1 hour). Expensive **icon** call (FREE trial: 150/day and 150/month). Skip it when `search_icons` already has the metadata you need.

**Parameters:**
- `icon_id` (number, required): Unique icon ID
- `thumbnail_size` (number, optional): `42`, `84`, or `200` pixels

**Returns:** Icon name and ID, creator, tags, collections, license, download URLs.

**Example:**
```
Show me details for icon 12345
```

### `download_icon`

Download one icon as SVG or PNG. Expensive **icon** call. Use only when the user asked to save or embed the file.

**Parameters:**
- `icon_id` (number, required): ID of the icon to download
- `color` (string, optional): Hex color (e.g. `"FF0000"` for red)
- `filetype` (string, optional): `svg` or `png`
- `size` (number, optional): PNG size in pixels, 20–1200. Ignored for SVG.
- `save_to_file` (string, optional): File path to write the icon

**Note:** FREE tier can only download public domain icons.

**Example:**
```
Download icon 12345 as PNG, 200x200, red color, save to ./icons/coffee.png
```

### `search_collections`

Find icon collections by keyword. Service call.

**Parameters:**
- `query` (string, required): Collection search term
- `limit` (number, optional): Max results
- `next_page` / `prev_page` (string, optional): Pagination tokens

**Example:**
```
Search for 'travel' collections
```

### `get_collection`

View a specific collection and a page of its icons. Service call. Prefer this over calling `get_icon` on each member.

**Parameters:**
- `collection_id` (number, required): Unique collection ID
- `thumbnail_size` (number, optional): `42`, `84`, or `200` pixels
- `include_svg` (number, optional): `1` = include SVG URLs
- `limit` (number, optional): Icon limit in the collection page
- `next_page` / `prev_page` (string, optional): Pagination tokens

**Example:**
```
Show me collection 456
```

### `icon_autocomplete`

Get search-term suggestions (max 10). Cheap service call — use before searching if the query is ambiguous.

**Parameters:**
- `query` (string, required): Prefix to complete
- `limit` (number, optional): Number of suggestions (maximum 10)

**Example:**
```
What terms start with 'comp'?
```

### `check_usage`

Show current API usage vs limits for hourly, daily, and monthly windows, split into service calls vs icon calls. Cached for 5 minutes.

**Shows:** Limit and usage per window, remaining calls, percentage used, days until reset, and FREE-tier optimization tips.

**Example:**
```
How many API calls have I used this month?
```

## FREE vs PAID

Set `NOUN_API_TIER` to `FREE` or `PAID`. Switch anytime.

| Feature | FREE Trial | PAID (Pay-Per-Use) |
|---------|------------|--------------------|
| Service calls | 1,000/day · 2,000/month | 200,000/day · 3,000,000/month |
| Icon calls (`get_icon`, `download_icon`) | 150/day · 150/month | 10,000/day · 150,000/month |
| Download access | Public domain only | All icons |
| Results per page | 10 max | 100 max |
| Default thumbnail | 42px | 84px |
| SVG URLs | Excluded | Included |
| GET cache | 5 min | 5 min |
| 429 handling | Retry + Retry-After (capped) | Retry + Retry-After (capped) |

All keys also have hourly limits. Pricing: [The Noun Project API](https://thenounproject.com/api/).

## FREE-tier best practices

Protect the tight **icon-call** cap (150/day):

1. **Search is enough for browsing.** `search_icons` already returns ID, style, license, thumbnail, tags, and attribution. Do not call `get_icon` for every result.
2. **Be specific.** `"coffee cup"` beats `"icon"`.
3. **Autocomplete first** when the query is a fragment (`"cof"` → `"coffee cup"`).
4. **Avoid pagination.** Refine the query instead of walking five pages.
5. **Download once, reuse.** Each download is an icon call.
6. **Filter public domain** with `limit_to_public_domain=1` — FREE accounts cannot download licensed icons.
7. **Cache locally.** The server caches identical GETs for 5 minutes; also save downloaded files and icon IDs you have already explored.
