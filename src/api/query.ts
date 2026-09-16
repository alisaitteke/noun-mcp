/**
 * RFC 3986 query strings for OAuth 1.0a.
 * URLSearchParams uses `+` for spaces, which breaks Noun Project signatures (HTTP 403).
 */
export function buildQuery(params: Record<string, string | number | boolean | undefined | null>): string {
  const parts: string[] = [];

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') {
      continue;
    }
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`);
  }

  return parts.join('&');
}

export function withQuery(path: string, params: Record<string, string | number | boolean | undefined | null>): string {
  const query = buildQuery(params);
  return query ? `${path}?${query}` : path;
}
