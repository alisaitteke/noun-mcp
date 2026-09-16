# Troubleshooting

Common issues when connecting to The Noun Project through the MCP server.

← Back to [README](../README.md)

### "Missing required environment variables"

API keys were not found.

1. Check that `.env` exists (local runs) or that the MCP client `env` block is set
2. Verify `NOUN_CONSUMER_KEY` and `NOUN_CONSUMER_SECRET` are present
3. Check for typos in variable names

### "Authentication failed"

Invalid API credentials.

1. Verify credentials at the [developers page](https://thenounproject.com/developers/apps/)
2. Copy the entire key and secret
3. Strip extra spaces or quotes

### "Rate limit exceeded"

An hourly, daily, or monthly window (service or icon) was exhausted — or requests were sent too fast.

- Run `check_usage` to see which window is empty
- Stop calling `get_icon` on every search hit (icon quota is the usual culprit on the free trial)
- Wait for the window in the error message to reset
- The server queues requests (one at a time), retries transient 429/5xx with backoff, and caches identical GETs for 5 minutes

### SVG URLs not working

SVG URLs from `get_icon` expire after 1 hour.

- Request a fresh URL when needed
- Use `download_icon` to get a file (or base64) instead of a temporary URL
- Save icons locally rather than relying on remote URLs

### "Free API access is limited to public domain icons"

The FREE trial cannot download licensed icons.

- Filter searches with `limit_to_public_domain=1`
- Or upgrade to Pay-Per-Use at the [pricing page](https://thenounproject.com/pricing)

### Server not appearing in Cursor / Claude

1. Restart Cursor or Claude Desktop
2. Check JSON config syntax (no trailing commas)
3. Verify file paths are absolute if you are pointing at a local `dist/index.js`
4. Check server logs for errors

Quota windows and FREE vs PAID limits: [`available-tools.md`](available-tools.md#free-vs-paid).
