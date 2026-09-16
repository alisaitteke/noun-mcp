/**
 * Typed errors for The Noun Project API client.
 * Preserves status, Retry-After, and body fields the interceptor used to drop.
 */

export type ApiErrorInit = {
  message: string;
  status?: number;
  code?: string;
  retryAfterMs?: number;
  requestId?: string;
  retryable?: boolean;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly code?: string;
  readonly retryAfterMs?: number;
  readonly requestId?: string;
  readonly retryable: boolean;

  constructor(init: ApiErrorInit) {
    super(init.message);
    this.name = 'ApiError';
    this.status = init.status;
    this.code = init.code;
    this.retryAfterMs = init.retryAfterMs;
    this.requestId = init.requestId;
    this.retryable = init.retryable ?? isRetryableStatus(init.status);
  }
}

export const MAX_ATTEMPTS = 3;
export const MAX_RETRY_WAIT_MS = 8_000;

export function isRetryableStatus(status?: number): boolean {
  if (status === undefined) {
    return true;
  }
  if (status === 429) {
    return true;
  }
  return status >= 500 && status < 600;
}

export function shouldRetryAttempt(
  error: { retryable: boolean; retryAfterMs?: number },
  attempt: number
): boolean {
  if (!error.retryable) {
    return false;
  }
  if (attempt >= MAX_ATTEMPTS - 1) {
    return false;
  }
  if (error.retryAfterMs !== undefined && error.retryAfterMs > MAX_RETRY_WAIT_MS) {
    return false;
  }
  return true;
}

export function parseRetryAfterMs(header: string | number | undefined | null): number | undefined {
  if (header === undefined || header === null || header === '') {
    return undefined;
  }

  if (typeof header === 'number' && Number.isFinite(header)) {
    return Math.max(0, header * 1000);
  }

  const raw = String(header).trim();
  const asSeconds = Number(raw);
  if (!Number.isNaN(asSeconds)) {
    return Math.max(0, asSeconds * 1000);
  }

  const asDate = Date.parse(raw);
  if (!Number.isNaN(asDate)) {
    return Math.max(0, asDate - Date.now());
  }

  return undefined;
}

export function computeBackoffMs(attempt: number, retryAfterMs?: number): number {
  if (retryAfterMs !== undefined) {
    return retryAfterMs;
  }

  const base = 500 * 2 ** attempt;
  const jitter = Math.floor(Math.random() * 250);
  return base + jitter;
}

const NETWORK_CODES = new Set([
  'ECONNABORTED',
  'ETIMEDOUT',
  'ECONNRESET',
  'ENOTFOUND',
  'EAI_AGAIN',
  'EPIPE',
]);

export function isNetworkError(error: { code?: string; message?: string }): boolean {
  if (error.code && NETWORK_CODES.has(error.code)) {
    return true;
  }
  const message = error.message ?? '';
  return /timeout/i.test(message) || /network/i.test(message);
}

type ErrorBody = {
  message?: unknown;
  error?: unknown;
  request_id?: unknown;
  status?: unknown;
};

export function messageFromBody(data: unknown, fallback: string): { message: string; code?: string; requestId?: string } {
  if (!data || typeof data !== 'object') {
    return { message: fallback };
  }

  const body = data as ErrorBody;
  const message = typeof body.message === 'string' && body.message.trim()
    ? body.message
    : fallback;
  const code = typeof body.error === 'string' ? body.error : undefined;
  const requestId = typeof body.request_id === 'string' ? body.request_id : undefined;

  return { message, code, requestId };
}
