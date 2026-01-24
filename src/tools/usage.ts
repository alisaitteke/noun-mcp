/**
 * API usage information tool handler
 */

import { checkUsage } from '../api/client.js';
import { CheckUsageInputSchema, CheckUsageResponse } from '../types/schemas.js';
import { LRUCache } from 'lru-cache';
import { isFreeTier, getOptimizationTips } from '../utils/costOptimizer.js';

/**
 * Usage cache - cache for 5 minutes
 */
const usageCache = new LRUCache<string, CheckUsageResponse>({
  max: 1,
  ttl: 5 * 60 * 1000, // 5 minutes
});

/**
 * check_usage tool handler
 * 
 * Checks API usage limits and current usage.
 * Results are cached for 5 minutes.
 * 
 * @param args - Tool arguments (no parameters)
 * @returns MCP response with usage information
 */
export async function handleCheckUsage(args: unknown) {
  // Input validation (empty object expected)
  CheckUsageInputSchema.parse(args);
  
  // Check cache first
  const cacheKey = 'usage';
  const cachedUsage = usageCache.get(cacheKey);
  
  if (cachedUsage) {
    const resultText = formatUsageInfo(cachedUsage, true);
    return {
      content: [
        {
          type: 'text',
          text: resultText,
        },
      ],
    };
  }
  
  // API call
  const response: CheckUsageResponse = await checkUsage();
  
  // Cache the result
  usageCache.set(cacheKey, response);
  
  // Format response
  const resultText = formatUsageInfo(response, false);
  
  return {
    content: [
      {
        type: 'text',
        text: resultText,
      },
    ],
  };
}

/**
 * Format usage information
 */
function formatUsageInfo(response: CheckUsageResponse, fromCache: boolean): string {
  const { monthly } = response;
  const usage = monthly.usage;
  const limit = monthly.limit;
  const remaining = limit - usage;
  const percentage = Math.round((usage / limit) * 100);
  
  let output = `📊 **API Usage Information**\n\n`;
  
  if (fromCache) {
    output += `💾 *(Retrieved from cache - valid for 5 min)*\n\n`;
  }
  
  output += `**Monthly Limit:** ${limit} requests\n`;
  output += `**Used:** ${usage} requests\n`;
  output += `**Remaining:** ${remaining} requests\n`;
  output += `**Usage Rate:** ${percentage}%\n\n`;
  
  // Progress bar
  const barLength = 20;
  const filledLength = Math.round((usage / limit) * barLength);
  const bar = '█'.repeat(filledLength) + '░'.repeat(barLength - filledLength);
  output += `[${bar}] ${percentage}%\n\n`;
  
  // Warning if usage is high
  if (percentage >= 90) {
    output += `⚠️ **WARNING:** You've used 90% of your API limit!\n`;
    output += `Please use the API more carefully.\n\n`;
  } else if (percentage >= 75) {
    output += `⚡ **ATTENTION:** You've exceeded 75% of your API limit.\n\n`;
  }
  
  // Reset info
  const now = new Date();
  const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  const daysUntilReset = Math.ceil((nextMonth.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  output += `🔄 **Limit Reset:** in ${daysUntilReset} days (${nextMonth.toLocaleDateString('en-US')})\n\n`;
  
  // Add optimization tips for FREE tier
  if (isFreeTier()) {
    const tips = getOptimizationTips();
    output += tips.join('\n') + '\n\n';
    output += `💡 **Upgrade:** Set NOUN_API_TIER=PAID in your .env for unlimited access.\n`;
  } else {
    output += `💎 **PAID Tier:** You have unlimited API access!\n`;
  }
  
  output += `More info: https://thenounproject.com/pricing\n`;
  
  return output;
}
