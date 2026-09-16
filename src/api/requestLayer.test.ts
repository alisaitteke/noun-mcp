import assert from 'node:assert/strict';
import { afterEach, describe, it } from 'node:test';
import {
  ApiError,
  parseRetryAfterMs,
  shouldRetryAttempt,
} from './errors.js';
import {
  assertQuotaAvailable,
  clearUsageSnapshot,
  findExhaustedWindow,
  formatUsageBrief,
  harvestUsageFromResponse,
  parseUsagePayload,
  remainingFor,
  setUsageSnapshot,
} from './usage.js';
import { getCached, invalidateCaches, setCached } from './cache.js';
import { buildQuery } from './query.js';

describe('parseUsagePayload', () => {
  afterEach(() => {
    clearUsageSnapshot();
  });

  it('parses the legacy monthly.limit/usage envelope', () => {
    const snapshot = parseUsagePayload({
      monthly: { limit: 5000, usage: 440 },
    });

    assert.ok(snapshot?.monthly);
    assert.equal(snapshot.monthly.combined, true);
    assert.equal(snapshot.monthly.serviceUsed, 440);
    assert.equal(snapshot.monthly.serviceLimit, 5000);
    assert.equal(remainingFor('service', snapshot.monthly), 4560);
  });

  it('parses usage_limits nested on search responses', () => {
    const snapshot = parseUsagePayload({
      icons: [],
      usage_limits: { monthly: { limit: 5000, usage: 17 } },
    });

    assert.equal(snapshot?.monthly?.serviceUsed, 17);
    assert.equal(formatUsageBrief({ usage_limits: { monthly: { limit: 5000, usage: 17 } } }), 'API usage: monthly 17/5000');
  });

  it('parses the v2 hourly/daily/monthly service vs icon schema', () => {
    const snapshot = parseUsagePayload({
      generated_at: '2026-05-28T14:00:00Z',
      usage: {
        hourly: {
          service_calls_used: 10,
          service_calls_limit: 100,
          icon_calls_used: 5,
          icon_calls_limit: 20,
          period_end: '2026-05-28T15:00:00Z',
        },
        daily: {
          service_calls_used: 245,
          service_calls_limit: 1000,
          icon_calls_used: 38,
          icon_calls_limit: 150,
          period_end: '2026-05-29T00:00:00Z',
        },
        monthly: {
          service_calls_used: 400,
          service_calls_limit: 2000,
          icon_calls_used: 150,
          icon_calls_limit: 150,
          period_end: '2026-06-01T00:00:00Z',
        },
      },
    });

    assert.equal(snapshot?.hourly?.serviceUsed, 10);
    assert.equal(snapshot?.daily?.iconUsed, 38);
    assert.equal(snapshot?.monthly?.iconUsed, 150);
    assert.equal(remainingFor('icon', snapshot!.monthly!), 0);

    const exhausted = findExhaustedWindow(snapshot!, 'icon');
    assert.equal(exhausted?.name, 'monthly');
    assert.equal(exhausted?.window.iconLimit, 150);
  });

  it('parses the live monthly.usage.icon/service + cost envelope', () => {
    const snapshot = parseUsagePayload({
      monthly: {
        usage: { icon: 0, service: 3 },
        cost: { icon: 0, service: 0.0075, total_monthly_percentage: 0.15 },
      },
    });

    assert.equal(snapshot?.monthly?.serviceUsed, 3);
    assert.equal(snapshot?.monthly?.iconUsed, 0);
    assert.equal(snapshot?.monthlyCost?.service, 0.0075);
    assert.equal(snapshot?.monthlyCost?.percent, 0.15);
    assert.match(formatUsageBrief({
      monthly: {
        usage: { icon: 0, service: 3 },
        cost: { icon: 0, service: 0.0075, total_monthly_percentage: 0.15 },
      },
    }), /monthly service 3, icon 0/);
  });
});

describe('assertQuotaAvailable', () => {
  afterEach(() => {
    clearUsageSnapshot();
  });

  it('fails fast when icon remaining is 0', () => {
    setUsageSnapshot({
      monthly: {
        serviceUsed: 10,
        serviceLimit: 2000,
        iconUsed: 150,
        iconLimit: 150,
      },
    });

    assert.doesNotThrow(() => assertQuotaAvailable('service'));
    assert.throws(
      () => assertQuotaAvailable('icon'),
      (error: unknown) => error instanceof ApiError && error.status === 429 && error.retryable === false
    );
  });

  it('allows requests when no snapshot has been harvested yet', () => {
    assert.doesNotThrow(() => assertQuotaAvailable('icon'));
  });

  it('harvests usage_limits from a 2xx payload into the snapshot', () => {
    harvestUsageFromResponse({
      usage_limits: {
        monthly: {
          service_calls_used: 1,
          service_calls_limit: 2000,
          icon_calls_used: 0,
          icon_calls_limit: 150,
        },
      },
    });

    assert.doesNotThrow(() => assertQuotaAvailable('icon'));
  });
});

describe('retry policy', () => {
  it('retries 429 when Retry-After is 1 second', () => {
    assert.equal(parseRetryAfterMs('1'), 1000);
    assert.equal(
      shouldRetryAttempt({ retryable: true, retryAfterMs: parseRetryAfterMs('1') }, 0),
      true
    );
  });

  it('does not retry 401 or 404', () => {
    assert.equal(shouldRetryAttempt({ retryable: false }, 0), false);
    const unauthorized = new ApiError({ status: 401, message: 'nope', retryable: false });
    const missing = new ApiError({ status: 404, message: 'gone', retryable: false });
    assert.equal(shouldRetryAttempt(unauthorized, 0), false);
    assert.equal(shouldRetryAttempt(missing, 0), false);
  });

  it('does not retry 429 when Retry-After exceeds the wait cap', () => {
    const retryAfterMs = parseRetryAfterMs('3600');
    assert.equal(retryAfterMs, 3_600_000);
    assert.equal(shouldRetryAttempt({ retryable: true, retryAfterMs }, 0), false);
  });
});

describe('GET cache', () => {
  afterEach(() => {
    invalidateCaches();
  });

  it('returns the same payload for an identical GET key', () => {
    const payload = { icons: [{ id: '1' }] };
    setCached('GET /icon?query=coffee', payload);
    assert.deepEqual(getCached('GET /icon?query=coffee'), payload);
  });

  it('clears cached GETs on invalidate (e.g. after 429)', () => {
    setCached('GET /icon?query=coffee', { icons: [] });
    invalidateCaches();
    assert.equal(getCached('GET /icon?query=coffee'), undefined);
  });
});

describe('query encoding', () => {
  it('encodes spaces as %20 not + so OAuth signatures match', () => {
    assert.equal(buildQuery({ query: 'coffee cup', limit: 3 }), 'query=coffee%20cup&limit=3');
    assert.equal(new URLSearchParams({ query: 'coffee cup' }).toString(), 'query=coffee+cup');
  });
});
