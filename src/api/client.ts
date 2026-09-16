/**
 * The Noun Project API Client
 *
 * Axios + Bottleneck with typed errors, 429/5xx retry, GET caching,
 * and usage harvesting against the v2 service/icon quota model.
 */

import axios, { AxiosError, AxiosInstance, AxiosResponseHeaders, RawAxiosResponseHeaders } from 'axios';
import Bottleneck from 'bottleneck';
import { getOAuthHeaders } from './auth.js';
import { cacheKey as buildCacheKey, getCached, invalidateCaches, setCached } from './cache.js';
import {
  ApiError,
  computeBackoffMs,
  isNetworkError,
  MAX_ATTEMPTS,
  MAX_RETRY_WAIT_MS,
  messageFromBody,
  parseRetryAfterMs,
  shouldRetryAttempt,
} from './errors.js';
import {
  assertQuotaAvailable,
  CallKind,
  formatExhaustedMessage,
  findExhaustedWindow,
  getUsageSnapshot,
  harvestUsageFromResponse,
} from './usage.js';
import { optimizeLimit, shouldIncludeSvg, isFreeTier } from '../utils/costOptimizer.js';
import { withQuery } from './query.js';

const API_BASE_URL = 'https://api.thenounproject.com/v2';

const limiter = new Bottleneck({
  maxConcurrent: 1,
  minTime: 400,
});

let axiosInstance: AxiosInstance | null = null;
let pausedUntil = 0;

export function initializeClient(): void {
  axiosInstance = axios.create({
    baseURL: API_BASE_URL,
    timeout: 30000,
    headers: {
      Accept: 'application/json',
    },
  });

  axiosInstance.interceptors.request.use(
    (config) => {
      const fullUrl = `${API_BASE_URL}${config.url}`;
      const method = config.method?.toUpperCase() || 'GET';
      const oauthHeaders = getOAuthHeaders(fullUrl, method);
      config.headers.Authorization = oauthHeaders.Authorization;
      return config;
    },
    (error) => Promise.reject(error)
  );

  axiosInstance.interceptors.response.use(
    (response) => {
      harvestUsageFromResponse(response.data);
      return response;
    },
    (error: AxiosError) => Promise.reject(toApiError(error))
  );
}

async function makeRequest<T>(
  requestFn: () => Promise<T>,
  options: { kind: CallKind; cacheKey?: string; skipQuotaGuard?: boolean }
): Promise<T> {
  if (!axiosInstance) {
    throw new Error('API client is not initialized. Please call initializeClient() first.');
  }

  if (options.cacheKey) {
    const hit = getCached<T>(options.cacheKey);
    if (hit !== undefined) {
      return hit;
    }
  }

  if (!options.skipQuotaGuard) {
    assertQuotaAvailable(options.kind);
  }

  let lastError: ApiError | undefined;

  for (let attempt = 0; attempt < MAX_ATTEMPTS; attempt++) {
    await waitIfPaused();

    try {
      const data = await limiter.schedule(requestFn);
      if (options.cacheKey) {
        setCached(options.cacheKey, data);
      }
      return data;
    } catch (error) {
      const apiError = error instanceof ApiError ? error : wrapUnknownError(error);
      lastError = apiError;

      if (apiError.status === 429) {
        invalidateCaches();
        lastError = enrichRateLimitError(apiError, options.kind);
      }

      if (!shouldRetryAttempt(lastError, attempt)) {
        throw lastError;
      }

      const delay = Math.min(computeBackoffMs(attempt, lastError.retryAfterMs), MAX_RETRY_WAIT_MS);
      pauseFor(delay);
      await sleep(delay);
    }
  }

  throw lastError ?? new ApiError({ message: 'Request failed after retries.' });
}

function enrichRateLimitError(error: ApiError, kind: CallKind): ApiError {
  const current = getUsageSnapshot();
  if (!current) {
    return error;
  }

  const exhausted = findExhaustedWindow(current, kind);
  if (!exhausted) {
    return new ApiError({
      message:
        `${error.message} This was a ${kind} call. ` +
        `Icon calls (get_icon, download_icon) share a much smaller quota than searches.`,
      status: error.status,
      code: error.code ?? 'rate_limit_exceeded',
      retryAfterMs: error.retryAfterMs,
      requestId: error.requestId,
      retryable: error.retryable,
    });
  }

  return new ApiError({
    message: formatExhaustedMessage(kind, exhausted.name, exhausted.window),
    status: error.status,
    code: error.code ?? 'rate_limit_exceeded',
    retryAfterMs: error.retryAfterMs,
    requestId: error.requestId,
    retryable: error.retryable,
  });
}

function toApiError(error: AxiosError): ApiError {
  if (error.response) {
    const status = error.response.status;
    const { message, code, requestId } = messageFromBody(
      error.response.data,
      error.message || `API error (${status})`
    );
    const retryAfterMs = parseRetryAfterMs(headerValue(error.response.headers, 'retry-after'));

    if (status === 401) {
      return new ApiError({
        status,
        code,
        requestId,
        retryable: false,
        message:
          'Authentication failed. Please check your NOUN_CONSUMER_KEY and NOUN_CONSUMER_SECRET.\n' +
          'Visit https://thenounproject.com/developers/apps/ to verify your credentials.',
      });
    }

    if (status === 403) {
      return new ApiError({
        status,
        code,
        requestId,
        retryable: false,
        message:
          `API error (403): ${message}. ` +
          'This is often an OAuth signature mismatch or a key that cannot call this endpoint.',
      });
    }

    if (status === 404) {
      return new ApiError({
        status,
        code,
        requestId,
        retryable: false,
        message: `Resource not found: ${error.config?.url}`,
      });
    }

    if (status === 429) {
      return new ApiError({
        status,
        code: code ?? 'rate_limit_exceeded',
        requestId,
        retryAfterMs,
        retryable: true,
        message: message || 'Rate limit exceeded. Please wait before making more requests.',
      });
    }

    return new ApiError({
      status,
      code,
      requestId,
      retryAfterMs,
      retryable: status >= 500,
      message: `API error (${status}): ${message}`,
    });
  }

  if (error.request || isNetworkError(error)) {
    return new ApiError({
      retryable: true,
      code: error.code,
      message: isNetworkError(error)
        ? `No response from The Noun Project API (${error.code || 'timeout'}). Retrying may succeed.`
        : 'No response from The Noun Project API. Please check your internet connection.',
    });
  }

  return new ApiError({
    retryable: false,
    message: `Request error: ${error.message}`,
  });
}

function wrapUnknownError(error: unknown): ApiError {
  if (error instanceof ApiError) {
    return error;
  }
  if (error instanceof Error) {
    return new ApiError({ message: error.message, retryable: false });
  }
  return new ApiError({ message: String(error), retryable: false });
}

function headerValue(
  headers: AxiosResponseHeaders | RawAxiosResponseHeaders | undefined,
  name: string
): string | undefined {
  if (!headers) {
    return undefined;
  }

  const direct = headers[name] ?? headers[name.toLowerCase()];
  const fromGet = typeof headers.get === 'function' ? headers.get(name) : undefined;
  return stringifyHeader(direct ?? fromGet);
}

function stringifyHeader(value: unknown): string | undefined {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }
  if (Array.isArray(value) && value[0] != null) {
    return String(value[0]);
  }
  return undefined;
}

function pauseFor(ms: number): void {
  pausedUntil = Math.max(pausedUntil, Date.now() + ms);
}

async function waitIfPaused(): Promise<void> {
  const wait = pausedUntil - Date.now();
  if (wait > 0) {
    await sleep(wait);
  }
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function searchIcons(
  query: string,
  options: {
    styles?: 'solid' | 'line' | 'solid,line';
    line_weight?: number | string;
    limit_to_public_domain?: 0 | 1;
    thumbnail_size?: 42 | 84 | 200;
    include_svg?: 0 | 1;
    limit?: number;
    next_page?: string;
    prev_page?: string;
  } = {}
) {
  const thumbnailSize = options.thumbnail_size || (isFreeTier() ? 42 : 84);
  const includeSvg = options.include_svg !== undefined ? options.include_svg : shouldIncludeSvg() ? 1 : 0;
  const url = withQuery('/icon', {
    query,
    styles: options.styles,
    line_weight: options.line_weight,
    limit_to_public_domain: options.limit_to_public_domain,
    thumbnail_size: thumbnailSize,
    include_svg: includeSvg,
    limit: optimizeLimit(options.limit, 20),
    next_page: options.next_page,
    prev_page: options.prev_page,
  });

  return makeRequest(async () => {
    const response = await axiosInstance!.get(url);
    return response.data;
  }, { kind: 'service', cacheKey: buildCacheKey('GET', url) });
}

export async function getIcon(iconId: number, thumbnailSize?: 42 | 84 | 200) {
  const url = withQuery(`/icon/${iconId}`, {
    thumbnail_size: thumbnailSize,
  });

  return makeRequest(async () => {
    const response = await axiosInstance!.get(url);
    return response.data;
  }, { kind: 'icon', cacheKey: buildCacheKey('GET', url) });
}

export async function downloadIcon(
  iconId: number,
  options: {
    color?: string;
    filetype?: 'svg' | 'png';
    size?: number;
  } = {}
) {
  const url = withQuery(`/icon/${iconId}/download`, {
    color: options.color,
    filetype: options.filetype,
    size: options.size && options.filetype === 'png' ? options.size : undefined,
  });

  return makeRequest(async () => {
    const response = await axiosInstance!.get(url);
    return response.data;
  }, { kind: 'icon' });
}

export async function searchCollections(
  query: string,
  options: {
    limit?: number;
    next_page?: string;
    prev_page?: string;
  } = {}
) {
  const url = withQuery('/collection', {
    query,
    limit: optimizeLimit(options.limit, 10),
    next_page: options.next_page,
    prev_page: options.prev_page,
  });

  return makeRequest(async () => {
    const response = await axiosInstance!.get(url);
    return response.data;
  }, { kind: 'service', cacheKey: buildCacheKey('GET', url) });
}

export async function getCollection(
  collectionId: number,
  options: {
    thumbnail_size?: 42 | 84 | 200;
    include_svg?: 0 | 1;
    limit?: number;
    next_page?: string;
    prev_page?: string;
  } = {}
) {
  const url = withQuery(`/collection/${collectionId}`, {
    thumbnail_size: options.thumbnail_size || (isFreeTier() ? 42 : 84),
    include_svg: options.include_svg !== undefined ? options.include_svg : shouldIncludeSvg() ? 1 : 0,
    limit: optimizeLimit(options.limit, 10),
    next_page: options.next_page,
    prev_page: options.prev_page,
  });

  return makeRequest(async () => {
    const response = await axiosInstance!.get(url);
    return response.data;
  }, { kind: 'service', cacheKey: buildCacheKey('GET', url) });
}

export async function iconAutocomplete(query: string, limit: number = 10) {
  const url = withQuery('/icon/autocomplete', {
    query,
    limit: Math.min(limit, 10),
  });

  return makeRequest(async () => {
    const response = await axiosInstance!.get(url);
    return response.data;
  }, { kind: 'service', cacheKey: buildCacheKey('GET', url) });
}

export async function checkUsage() {
  return makeRequest(async () => {
    const response = await axiosInstance!.get('/client/usage');
    return response.data;
  }, { kind: 'service', cacheKey: buildCacheKey('GET', '/client/usage'), skipQuotaGuard: true });
}
