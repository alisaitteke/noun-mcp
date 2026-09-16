/**
 * API usage information tool handler
 */

import { checkUsage } from '../api/client.js';
import { onCacheInvalidate } from '../api/cache.js';
import {
  formatUsageBrief,
  parseUsagePayload,
  remainingFor,
  UsageSnapshot,
} from '../api/usage.js';
import { CheckUsageInputSchema, CheckUsageResponse } from '../types/schemas.js';
import { LRUCache } from 'lru-cache';
import { isFreeTier, getOptimizationTips, getCostWarningFromSnapshot } from '../utils/costOptimizer.js';

const usageCache = new LRUCache<string, CheckUsageResponse>({
  max: 1,
  ttl: 5 * 60 * 1000,
});

onCacheInvalidate(() => {
  usageCache.clear();
});

export async function handleCheckUsage(args: unknown) {
  CheckUsageInputSchema.parse(args);

  const cacheKey = 'usage';
  const cachedUsage = usageCache.get(cacheKey);

  if (cachedUsage) {
    return {
      content: [
        {
          type: 'text',
          text: formatUsageInfo(cachedUsage, true),
        },
      ],
    };
  }

  const response: CheckUsageResponse = await checkUsage();
  usageCache.set(cacheKey, response);

  return {
    content: [
      {
        type: 'text',
        text: formatUsageInfo(response, false),
      },
    ],
  };
}

function formatUsageInfo(response: CheckUsageResponse, fromCache: boolean): string {
  const snapshot = parseUsagePayload(response);

  let output = `📊 **API Usage Information**\n\n`;

  if (fromCache) {
    output += `💾 *(Retrieved from cache - valid for 5 min)*\n\n`;
  }

  if (!snapshot) {
    output += `Could not parse usage payload. Raw response:\n\n`;
    output += '```json\n' + JSON.stringify(response, null, 2) + '\n```\n';
    return output;
  }

  output += formatWindows(snapshot);

  if (snapshot.monthlyCost) {
    const { service, icon, percent } = snapshot.monthlyCost;
    output += `**Cost (this month)**\n`;
    output += `- Service: $${service.toFixed(4)}\n`;
    output += `- Icon: $${icon.toFixed(4)}\n`;
    output += `- Total: $${(service + icon).toFixed(4)}`;
    if (percent != null) {
      output += ` (${percent}% of monthly cap)`;
    }
    output += `\n\n`;
  }

  output += `${formatUsageBrief(response)}\n`;

  const warning = getCostWarningFromSnapshot(snapshot);
  if (warning) {
    output += warning + '\n';
  }

  const monthlyReset = snapshot.monthly?.periodEnd;
  if (monthlyReset) {
    output += `\n🔄 **Monthly window ends:** ${monthlyReset}\n\n`;
  } else {
    const now = new Date();
    const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    output += `\n🔄 **Calendar month reset:** in ${daysUntilReset} days (${nextMonth.toLocaleDateString('en-US')})\n\n`;
  }

  if (isFreeTier()) {
    const tips = getOptimizationTips();
    output += tips.join('\n') + '\n\n';
    output += `💡 **Upgrade:** Set NOUN_API_TIER=PAID after moving to Pay-Per-Use. Pricing: https://thenounproject.com/api/\n`;
  } else {
    output += `💎 **PAID Tier:** Limits still apply (hourly/daily/monthly, service vs icon). Check the windows above.\n`;
  }

  output += `More info: https://thenounproject.com/api/\n`;

  return output;
}

function formatWindows(snapshot: UsageSnapshot): string {
  const rows: Array<[string, NonNullable<UsageSnapshot['monthly']>]> = [];
  if (snapshot.hourly) rows.push(['Hourly', snapshot.hourly]);
  if (snapshot.daily) rows.push(['Daily', snapshot.daily]);
  if (snapshot.monthly) rows.push(['Monthly', snapshot.monthly]);

  if (rows.length === 0) {
    return '';
  }

  let output = '';
  for (const [label, window] of rows) {
    output += `**${label}**\n`;
    if (window.combined) {
      const remaining = remainingFor('service', window);
      const percentage = window.serviceLimit
        ? Math.round((window.serviceUsed / window.serviceLimit) * 100)
        : 0;
      output += `- Requests: ${window.serviceUsed}/${window.serviceLimit} (${remaining} remaining, ${percentage}%)\n`;
      output += `${progressBar(percentage)}\n`;
    } else {
      output += formatFamily('Service calls', window.serviceUsed, window.serviceLimit);
      output += formatFamily('Icon calls', window.iconUsed, window.iconLimit);
    }
    if (window.periodEnd) {
      output += `- Window ends: ${window.periodEnd}\n`;
    }
    output += '\n';
  }

  return output;
}

function formatFamily(label: string, used: number, limit: number): string {
  if (!Number.isFinite(limit)) {
    return `- ${label}: ${used} used\n`;
  }
  const remaining = Math.max(0, limit - used);
  const percentage = limit > 0 ? Math.round((used / limit) * 100) : 0;
  return `- ${label}: ${used}/${limit} (${remaining} remaining, ${percentage}%)\n${progressBar(percentage)}\n`;
}

function progressBar(percentage: number): string {
  const barLength = 20;
  const filledLength = Math.min(barLength, Math.max(0, Math.round((percentage / 100) * barLength)));
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  return `[${bar}] ${percentage}%`;
}
