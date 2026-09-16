/**
 * Cost Optimization Utilities
 *
 * Optimizes API usage based on the configured tier (FREE or PAID).
 * FREE trial: 2,000 service calls/month and 150 icon calls/month
 * (plus daily/hourly windows). PAID: much higher limits, no extra caps here.
 */

import { getUsageSnapshot, tightestUsagePercent, UsageSnapshot } from '../api/usage.js';

export type ApiTier = 'FREE' | 'PAID';

let currentTier: ApiTier = 'FREE';

export function initializeCostOptimizer(): void {
  const tier = process.env.NOUN_API_TIER?.toUpperCase();

  if (tier === 'PAID') {
    currentTier = 'PAID';
    console.error('💎 API Tier: PAID (Pay-per-use / custom limits)');
  } else {
    currentTier = 'FREE';
    console.error('🆓 API Tier: FREE trial (2,000 service / 150 icon calls per month — optimized mode)');
  }
}

export function getApiTier(): ApiTier {
  return currentTier;
}

export function isFreeTier(): boolean {
  return currentTier === 'FREE';
}

export function optimizeLimit(requestedLimit?: number, defaultLimit: number = 20): number {
  if (!isFreeTier()) {
    return requestedLimit || defaultLimit;
  }

  const freeTierMax = 10;

  if (!requestedLimit) {
    return freeTierMax;
  }

  return Math.min(requestedLimit, freeTierMax);
}

export function shouldLimitPagination(): boolean {
  return isFreeTier();
}

export function shouldIncludeSvg(explicitRequest?: boolean): boolean {
  if (explicitRequest !== undefined) {
    return explicitRequest;
  }

  return !isFreeTier();
}

export function getOptimizationTips(): string[] {
  if (!isFreeTier()) {
    return [];
  }

  return [
    '💡 **FREE Trial Tips:**',
    '- Searches are *service* calls (2,000/month, 1,000/day). get_icon and download_icon are *icon* calls (150/month **and** 150/day).',
    '- search_icons already returns IDs, style, license, thumbnail, and attribution — do not call get_icon for every result.',
    '- Use get_icon only when you need the SVG icon_url. Use download_icon only to save a file.',
    '- Results are limited to 10 per page. Avoid pagination when a more specific query will do.',
    '- SVG URLs are excluded by default (use include_svg=1 if needed).',
    '- Consider Pay-Per-Use at https://thenounproject.com/api/ for higher icon-call limits.',
  ];
}

export function getCostWarning(usedCalls: number, limitCalls: number): string {
  if (!isFreeTier() || !limitCalls) {
    return '';
  }

  return warningForPercent((usedCalls / limitCalls) * 100);
}

export function getCostWarningFromSnapshot(snapshot?: UsageSnapshot): string {
  if (!isFreeTier()) {
    return '';
  }

  const percent = tightestUsagePercent(snapshot ?? getUsageSnapshot() ?? {});
  if (percent === undefined) {
    return '';
  }

  return warningForPercent(percent);
}

function warningForPercent(percentage: number): string {
  if (percentage >= 95) {
    return '\n⚠️ **CRITICAL:** You have used 95%+ of a FREE trial quota window (service or icon, hourly/daily/monthly). Icon calls are the tightest cap (150/day).\n';
  }
  if (percentage >= 80) {
    return '\n⚠️ **WARNING:** You have used 80%+ of a FREE trial quota window. Prefer search results over get_icon.\n';
  }
  if (percentage >= 50) {
    return '\n💡 **INFO:** You have used 50%+ of a FREE trial quota window.\n';
  }
  return '';
}

export function getFreeTierRecommendations(): {
  defaultLimit: number;
  includeSvg: boolean;
  thumbnailSize: 42 | 84 | 200;
} {
  return {
    defaultLimit: 10,
    includeSvg: false,
    thumbnailSize: 42,
  };
}
