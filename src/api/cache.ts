/**
 * Short-lived GET response cache. Stops LLM tool loops from burning quota
 * on identical search/get/collection/autocomplete calls.
 */

import { LRUCache } from 'lru-cache';

const GET_TTL_MS = 5 * 60 * 1000;
const GET_MAX_ENTRIES = 200;

const getCache = new LRUCache<string, object>({
  max: GET_MAX_ENTRIES,
  ttl: GET_TTL_MS,
});

const invalidators: Array<() => void> = [];

export function getCached<T>(key: string): T | undefined {
  return getCache.get(key) as T | undefined;
}

export function setCached<T>(key: string, value: T): void {
  getCache.set(key, value as object);
}

export function onCacheInvalidate(fn: () => void): void {
  invalidators.push(fn);
}

export function invalidateCaches(): void {
  getCache.clear();
  for (const fn of invalidators) {
    fn();
  }
}

export function cacheKey(method: string, url: string): string {
  return `${method.toUpperCase()} ${url}`;
}
