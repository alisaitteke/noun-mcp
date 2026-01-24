/**
 * Cost Optimization Utilities
 * 
 * Optimizes API usage based on the configured tier (FREE or PAID).
 * FREE tier: 5,000 calls/month - applies cost-saving measures
 * PAID tier: Unlimited - no restrictions
 */

/**
 * API Tier types
 */
export type ApiTier = 'FREE' | 'PAID';

/**
 * Current API tier from environment
 */
let currentTier: ApiTier = 'FREE';

/**
 * Initialize the cost optimizer with environment settings
 */
export function initializeCostOptimizer(): void {
  const tier = process.env.NOUN_API_TIER?.toUpperCase();
  
  if (tier === 'PAID') {
    currentTier = 'PAID';
    console.error('💎 API Tier: PAID (Unlimited calls)');
  } else {
    currentTier = 'FREE';
    console.error('🆓 API Tier: FREE (5,000 calls/month - Optimized mode)');
  }
}

/**
 * Get the current API tier
 */
export function getApiTier(): ApiTier {
  return currentTier;
}

/**
 * Check if we're in FREE tier (cost-conscious mode)
 */
export function isFreeTier(): boolean {
  return currentTier === 'FREE';
}

/**
 * Optimize search result limit based on tier
 * FREE: Returns smaller page size to reduce API calls
 * PAID: Returns requested limit or default
 * 
 * @param requestedLimit - The limit requested by user
 * @param defaultLimit - Default limit to use
 * @returns Optimized limit
 */
export function optimizeLimit(requestedLimit?: number, defaultLimit: number = 20): number {
  if (!isFreeTier()) {
    // PAID tier: use requested limit or default
    return requestedLimit || defaultLimit;
  }
  
  // FREE tier: cap at smaller values to save API calls
  const freeTierMax = 10; // Smaller page size for FREE tier
  
  if (!requestedLimit) {
    return freeTierMax; // Default for FREE tier
  }
  
  return Math.min(requestedLimit, freeTierMax);
}

/**
 * Check if pagination should be disabled
 * FREE: Suggests not using pagination to avoid extra calls
 * PAID: Pagination fully supported
 * 
 * @returns true if pagination should be limited
 */
export function shouldLimitPagination(): boolean {
  return isFreeTier();
}

/**
 * Check if SVG URLs should be included by default
 * FREE: Skip SVG URLs unless explicitly requested (saves data)
 * PAID: Include by default
 * 
 * @param explicitRequest - User explicitly requested SVG URLs
 * @returns true if SVG URLs should be included
 */
export function shouldIncludeSvg(explicitRequest?: boolean): boolean {
  if (explicitRequest !== undefined) {
    return explicitRequest;
  }
  
  // FREE tier: don't include SVG URLs by default
  // PAID tier: include by default
  return !isFreeTier();
}

/**
 * Get optimization tips for the user based on current tier
 * 
 * @returns Array of optimization tips
 */
export function getOptimizationTips(): string[] {
  if (!isFreeTier()) {
    return []; // No tips needed for PAID tier
  }
  
  return [
    '💡 **FREE Tier Tips:**',
    '- Results are limited to 10 per page to conserve API calls',
    '- Avoid pagination when possible (each page = 1 API call)',
    '- SVG URLs are excluded by default (use include_svg=1 if needed)',
    '- Be specific with search terms to get better results faster',
    '- Use autocomplete to find exact terms before searching',
    '- Consider upgrading to PAID tier for unlimited access',
  ];
}

/**
 * Format cost optimization warning for responses
 * 
 * @param usedCalls - Number of calls used
 * @param limitCalls - Total limit
 * @returns Warning message or empty string
 */
export function getCostWarning(usedCalls: number, limitCalls: number): string {
  if (!isFreeTier()) {
    return ''; // No warnings for PAID tier
  }
  
  const percentage = (usedCalls / limitCalls) * 100;
  
  if (percentage >= 95) {
    return '\n⚠️ **CRITICAL:** You\'ve used 95%+ of your FREE tier limit! Consider upgrading to PAID tier.\n';
  } else if (percentage >= 80) {
    return '\n⚠️ **WARNING:** You\'ve used 80%+ of your FREE tier limit. Use API calls carefully.\n';
  } else if (percentage >= 50) {
    return '\n💡 **INFO:** You\'ve used 50%+ of your FREE tier limit.\n';
  }
  
  return '';
}

/**
 * Get recommended settings for FREE tier
 */
export function getFreeTierRecommendations(): {
  defaultLimit: number;
  includeSvg: boolean;
  thumbnailSize: 42 | 84 | 200;
} {
  return {
    defaultLimit: 10,
    includeSvg: false,
    thumbnailSize: 42, // Smallest thumbnail to save bandwidth
  };
}
