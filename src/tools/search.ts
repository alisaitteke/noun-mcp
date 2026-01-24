/**
 * Icon search tool handler
 */

import { searchIcons } from '../api/client.js';
import { SearchIconsInputSchema, SearchIconsResponse } from '../types/schemas.js';
import { isFreeTier, shouldLimitPagination, getCostWarning } from '../utils/costOptimizer.js';

/**
 * search_icons tool handler
 * 
 * Searches for icons on The Noun Project.
 * Results can be narrowed down with filters like style, line weight, public domain, etc.
 * 
 * @param args - Tool arguments
 * @returns MCP response with icon search results
 */
export async function handleSearchIcons(args: unknown) {
  // Input validation
  const input = SearchIconsInputSchema.parse(args);
  
  // API call
  const response: SearchIconsResponse = await searchIcons(input.query, {
    styles: input.styles,
    line_weight: input.line_weight,
    limit_to_public_domain: input.limit_to_public_domain,
    thumbnail_size: input.thumbnail_size,
    include_svg: input.include_svg,
    limit: input.limit,
    next_page: input.next_page,
    prev_page: input.prev_page,
  });
  
  // Format response
  const resultText = formatSearchResults(response);
  
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
 * Format search results into readable text
 */
function formatSearchResults(response: SearchIconsResponse): string {
  const { icons, total, next_page, prev_page, usage_limits } = response;
  
  let output = `🔍 **Icon Search Results**\n\n`;
  output += `📊 Found ${total} icons total\n`;
  output += `📄 Showing ${icons.length} icons on this page\n`;
  
  // FREE tier indicator
  if (isFreeTier()) {
    output += `🆓 FREE tier: Results optimized (max 10 per page)\n`;
  }
  output += `\n`;
  
  if (icons.length === 0) {
    output += `❌ No results found. Try different search terms.\n`;
    return output;
  }
  
  output += `---\n\n`;
  
  icons.forEach((icon, index) => {
    output += `### ${index + 1}. ${icon.term}\n`;
    output += `**ID:** ${icon.id}\n`;
    output += `**Style:** ${icon.styles.map(s => s.style + (s.line_weight ? ` (weight: ${s.line_weight})` : '')).join(', ')}\n`;
    output += `**Creator:** ${icon.creator.name} (@${icon.creator.username})\n`;
    output += `**License:** ${icon.license_description}\n`;
    
    if (icon.tags && icon.tags.length > 0) {
      output += `**Tags:** ${icon.tags.slice(0, 5).join(', ')}${icon.tags.length > 5 ? '...' : ''}\n`;
    }
    
    if (icon.thumbnail_url) {
      output += `**Thumbnail:** ${icon.thumbnail_url}\n`;
    }
    
    if (icon.icon_url) {
      output += `**SVG URL:** ${icon.icon_url}\n`;
    }
    
    output += `**Permalink:** https://thenounproject.com${icon.permalink}\n`;
    output += `**Attribution:** ${icon.attribution}\n`;
    output += `\n`;
  });
  
  output += `---\n\n`;
  
  // Pagination info with FREE tier warning
  if (next_page || prev_page) {
    output += `📖 **Pagination:**\n`;
    if (prev_page) output += `⬅️ Previous page token: \`${prev_page}\`\n`;
    if (next_page) output += `➡️ Next page token: \`${next_page}\`\n`;
    
    if (shouldLimitPagination()) {
      output += `\n⚠️ **FREE Tier Note:** Each page request uses 1 API call. Try to refine your search instead of paginating.\n`;
    }
    output += `\n`;
  }
  
  // Usage info with cost warning
  output += `📈 **API Usage:** ${usage_limits.monthly.usage}/${usage_limits.monthly.limit} (monthly)\n`;
  
  // Add cost warning if applicable
  const costWarning = getCostWarning(usage_limits.monthly.usage, usage_limits.monthly.limit);
  if (costWarning) {
    output += costWarning;
  }
  
  output += `\n💡 **Tip:** Use the \`download_icon\` tool to download an icon.\n`;
  
  return output;
}
