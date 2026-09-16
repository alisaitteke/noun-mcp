/**
 * Normalize Noun Project usage payloads (legacy monthly.limit/usage and
 * current hourly/daily/monthly × service/icon windows) into one snapshot.
 */

import { ApiError } from './errors.js';

export type CallKind = 'service' | 'icon';
export type WindowName = 'hourly' | 'daily' | 'monthly';

export interface QuotaWindow {
  serviceUsed: number;
  serviceLimit: number;
  iconUsed: number;
  iconLimit: number;
  periodStart?: string;
  periodEnd?: string;
  combined?: boolean;
}

export interface UsageSnapshot {
  hourly?: QuotaWindow;
  daily?: QuotaWindow;
  monthly?: QuotaWindow;
  generatedAt?: string;
  monthlyCost?: {
    service: number;
    icon: number;
    percent?: number;
  };
}

let snapshot: UsageSnapshot | undefined;

export function getUsageSnapshot(): UsageSnapshot | undefined {
  return snapshot;
}

export function setUsageSnapshot(next: UsageSnapshot | undefined): void {
  snapshot = next;
}

export function harvestUsageFromResponse(payload: unknown): UsageSnapshot | undefined {
  const parsed = parseUsagePayload(payload);
  if (parsed) {
    snapshot = mergeSnapshots(snapshot, parsed);
  }
  return snapshot;
}

export function clearUsageSnapshot(): void {
  snapshot = undefined;
}

export function parseUsagePayload(payload: unknown): UsageSnapshot | undefined {
  if (!payload || typeof payload !== 'object') {
    return undefined;
  }

  const root = payload as Record<string, unknown>;
  const nestedUsage = isPlainObject(root.usage) ? root.usage : undefined;
  const usageLimits = isPlainObject(root.usage_limits) ? root.usage_limits : undefined;
  const source = usageLimits ?? nestedUsage ?? root;

  const hourly = parseWindow(source.hourly);
  const daily = parseWindow(source.daily);
  const monthly = parseWindow(source.monthly);

  if (!hourly && !daily && !monthly) {
    return undefined;
  }

  return {
    hourly,
    daily,
    monthly,
    generatedAt: asString(root.generated_at) ?? asString(nestedUsage?.generated_at),
    monthlyCost: parseMonthlyCost(monthlySource(source) ?? root.monthly ?? nestedUsage),
  };
}

export function remainingFor(kind: CallKind, window: QuotaWindow): number {
  if (kind === 'icon') {
    return window.iconLimit - window.iconUsed;
  }
  return window.serviceLimit - window.serviceUsed;
}

export function findExhaustedWindow(
  current: UsageSnapshot,
  kind: CallKind
): { name: WindowName; window: QuotaWindow } | undefined {
  const windows: Array<[WindowName, QuotaWindow | undefined]> = [
    ['hourly', current.hourly],
    ['daily', current.daily],
    ['monthly', current.monthly],
  ];

  for (const [name, window] of windows) {
    if (!window) {
      continue;
    }
    if (remainingFor(kind, window) <= 0) {
      return { name, window };
    }
  }

  return undefined;
}

export function assertQuotaAvailable(kind: CallKind): void {
  if (!snapshot) {
    return;
  }

  if (snapshot.monthlyCost?.percent != null && snapshot.monthlyCost.percent >= 100) {
    throw new ApiError({
      status: 429,
      code: 'quota_exhausted',
      retryable: false,
      message:
        `Rate limit exceeded: monthly spend cap is at ${snapshot.monthlyCost.percent}%. ` +
        'Wait for the monthly window to reset, or raise the cap in the Noun Project dashboard.',
    });
  }

  const exhausted = findExhaustedWindow(snapshot, kind);
  if (!exhausted) {
    return;
  }

  throw new ApiError({
    status: 429,
    code: 'quota_exhausted',
    retryable: false,
    message: formatExhaustedMessage(kind, exhausted.name, exhausted.window),
  });
}

export function formatExhaustedMessage(
  kind: CallKind,
  windowName: WindowName,
  window: QuotaWindow
): string {
  const used = kind === 'icon' ? window.iconUsed : window.serviceUsed;
  const limit = kind === 'icon' ? window.iconLimit : window.serviceLimit;
  const reset = window.periodEnd ? ` Resets at ${window.periodEnd}.` : '';
  const callLabel = kind === 'icon' ? 'icon' : 'service';

  return (
    `Rate limit exceeded: ${callLabel} ${windowName} quota is exhausted ` +
    `(${used}/${limit}).${reset} ` +
    `Icon calls are GET /v2/icon/{id} and downloads; searches are service calls. ` +
    `Wait for the window to reset, or use cached search results instead of get_icon.`
  );
}

export function formatUsageBrief(source?: unknown): string {
  const current = parseUsagePayload(source) ?? snapshot;
  if (!current) {
    return '';
  }

  const parts: string[] = [];
  const windows: Array<[string, QuotaWindow | undefined]> = [
    ['hourly', current.hourly],
    ['daily', current.daily],
    ['monthly', current.monthly],
  ];

  for (const [name, window] of windows) {
    if (!window) {
      continue;
    }
    if (window.combined) {
      parts.push(`${name} ${window.serviceUsed}/${window.serviceLimit}`);
      continue;
    }
    if (!Number.isFinite(window.serviceLimit) && !Number.isFinite(window.iconLimit)) {
      parts.push(`${name} service ${window.serviceUsed}, icon ${window.iconUsed}`);
      continue;
    }
    parts.push(
      `${name} service ${window.serviceUsed}/${window.serviceLimit}, ` +
        `icon ${window.iconUsed}/${window.iconLimit}`
    );
  }

  if (current.monthlyCost) {
    const cost = current.monthlyCost;
    const percent = cost.percent != null ? `, ${cost.percent}% of monthly cap` : '';
    parts.push(`cost $${cost.service + cost.icon}${percent}`);
  }

  return parts.length ? `API usage: ${parts.join(' · ')}` : '';
}

export function tightestUsagePercent(current: UsageSnapshot = snapshot ?? {}): number | undefined {
  let worst: number | undefined;

  for (const window of [current.hourly, current.daily, current.monthly]) {
    if (!window) {
      continue;
    }
    for (const [used, limit] of [
      [window.serviceUsed, window.serviceLimit],
      [window.iconUsed, window.iconLimit],
    ] as const) {
      if (!Number.isFinite(limit) || limit <= 0) {
        continue;
      }
      const pct = (used / limit) * 100;
      if (worst === undefined || pct > worst) {
        worst = pct;
      }
    }
  }

  return worst;
}

function parseWindow(raw: unknown): QuotaWindow | undefined {
  if (!isPlainObject(raw)) {
    return undefined;
  }

  const serviceUsed = asNumber(raw.service_calls_used);
  const serviceLimit = asNumber(raw.service_calls_limit);
  const iconUsed = asNumber(raw.icon_calls_used);
  const iconLimit = asNumber(raw.icon_calls_limit);
  const usage = raw.usage;
  const limit = asNumber(raw.limit);
  const periodStart = asString(raw.period_start);
  const periodEnd = asString(raw.period_end);

  if (serviceLimit != null || iconLimit != null) {
    return {
      serviceUsed: serviceUsed ?? 0,
      serviceLimit: serviceLimit ?? Number.POSITIVE_INFINITY,
      iconUsed: iconUsed ?? 0,
      iconLimit: iconLimit ?? Number.POSITIVE_INFINITY,
      periodStart,
      periodEnd,
      combined: false,
    };
  }

  if (isPlainObject(usage) && (asNumber(usage.service) != null || asNumber(usage.icon) != null)) {
    return {
      serviceUsed: asNumber(usage.service) ?? 0,
      serviceLimit: Number.POSITIVE_INFINITY,
      iconUsed: asNumber(usage.icon) ?? 0,
      iconLimit: Number.POSITIVE_INFINITY,
      periodStart,
      periodEnd,
      combined: false,
    };
  }

  const usageCount = asNumber(usage);
  if (limit != null && usageCount != null) {
    return {
      serviceUsed: usageCount,
      serviceLimit: limit,
      iconUsed: usageCount,
      iconLimit: limit,
      periodStart,
      periodEnd,
      combined: true,
    };
  }

  return undefined;
}

function parseMonthlyCost(raw: unknown): UsageSnapshot['monthlyCost'] {
  if (!isPlainObject(raw)) {
    return undefined;
  }
  const cost = isPlainObject(raw.cost) ? raw.cost : undefined;
  if (!cost) {
    return undefined;
  }
  const service = asNumber(cost.service) ?? 0;
  const icon = asNumber(cost.icon) ?? 0;
  const percent = asNumber(cost.total_monthly_percentage);
  return { service, icon, percent };
}

function monthlySource(source: Record<string, unknown>): unknown {
  return source.monthly;
}

function mergeSnapshots(previous: UsageSnapshot | undefined, next: UsageSnapshot): UsageSnapshot {
  return {
    hourly: next.hourly ?? previous?.hourly,
    daily: next.daily ?? previous?.daily,
    monthly: next.monthly ?? previous?.monthly,
    generatedAt: next.generatedAt ?? previous?.generatedAt,
    monthlyCost: next.monthlyCost ?? previous?.monthlyCost,
  };
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function asNumber(value: unknown): number | undefined {
  return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value : undefined;
}
