/**
 * Collection and autocomplete tool handlers
 */

import { searchCollections, getCollection, iconAutocomplete } from '../api/client.js';
import { formatUsageBrief } from '../api/usage.js';
import {
  SearchCollectionsInputSchema,
  GetCollectionInputSchema,
  IconAutocompleteInputSchema,
  SearchCollectionsResponse,
  GetCollectionResponse,
  IconAutocompleteResponse,
} from '../types/schemas.js';
import { isFreeTier, shouldLimitPagination, getCostWarningFromSnapshot } from '../utils/costOptimizer.js';

/**
 * search_collections tool handler
 * 
 * Searches for collections on The Noun Project.
 * 
 * @param args - Tool arguments
 * @returns MCP response with collection search results
 */
export async function handleSearchCollections(args: unknown) {
  // Input validation
  const input = SearchCollectionsInputSchema.parse(args);
  
  // API call
  const response: SearchCollectionsResponse = await searchCollections(input.query, {
    limit: input.limit,
    next_page: input.next_page,
    prev_page: input.prev_page,
  });
  
  // Format response
  const resultText = formatCollectionSearchResults(response);
  
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
 * get_collection tool handler
 * 
 * Retrieves details and icons of a specific collection.
 * 
 * @param args - Tool arguments
 * @returns MCP response with collection details
 */
export async function handleGetCollection(args: unknown) {
  // Input validation
  const input = GetCollectionInputSchema.parse(args);
  
  // API call
  const response: GetCollectionResponse = await getCollection(input.collection_id, {
    thumbnail_size: input.thumbnail_size,
    include_svg: input.include_svg,
    limit: input.limit,
    next_page: input.next_page,
    prev_page: input.prev_page,
  });
  
  // Format response
  const resultText = formatCollectionDetails(response);
  
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
 * icon_autocomplete tool handler
 * 
 * Retrieves autocomplete suggestions for icon search.
 * 
 * @param args - Tool arguments
 * @returns MCP response with autocomplete suggestions
 */
export async function handleIconAutocomplete(args: unknown) {
  // Input validation
  const input = IconAutocompleteInputSchema.parse(args);
  
  // API call
  const response: IconAutocompleteResponse = await iconAutocomplete(input.query, input.limit);
  
  // Format response
  const resultText = formatAutocompleteResults(response);
  
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
 * Format collection search results
 */
function formatCollectionSearchResults(response: SearchCollectionsResponse): string {
  const { collections, total, next_page, prev_page } = response;
  
  let output = `📚 **Collection Search Results**\n\n`;
  output += `📊 Found ${total} collections total\n`;
  output += `📄 Showing ${collections.length} collections on this page\n`;
  
  // FREE tier indicator
  if (isFreeTier()) {
    output += `🆓 FREE tier: Results optimized (max 10 per page)\n`;
  }
  output += `\n`;
  
  if (collections.length === 0) {
    output += `❌ No results found. Try different search terms.\n`;
    return output;
  }
  
  output += `---\n\n`;
  
  collections.forEach((collection, index) => {
    output += `### ${index + 1}. ${collection.name}\n`;
    output += `**ID:** ${collection.id}\n`;
    output += `**Icon Count:** ${collection.icon_count}\n`;
    output += `**Creator:** ${collection.creator.name} (@${collection.creator.username})\n`;
    
    if (collection.tags && collection.tags.length > 0) {
      output += `**Tags:** ${collection.tags.slice(0, 5).join(', ')}${collection.tags.length > 5 ? '...' : ''}\n`;
    }
    
    output += `**Permalink:** https://thenounproject.com${collection.permalink}\n`;
    output += `\n`;
  });
  
  output += `---\n\n`;
  
  // Pagination info with FREE tier warning
  if (next_page || prev_page) {
    output += `📖 **Pagination:**\n`;
    if (prev_page) output += `⬅️ Previous page token: \`${prev_page}\`\n`;
    if (next_page) output += `➡️ Next page token: \`${next_page}\`\n`;
    
    if (shouldLimitPagination()) {
      output += `\n⚠️ **FREE Tier Note:** Each page request uses 1 API call.\n`;
    }
    output += `\n`;
  }
  
  const usageLine = formatUsageBrief(response.usage_limits ?? response);
  if (usageLine) {
    output += `📈 **${usageLine}**\n`;
  }

  const costWarning = getCostWarningFromSnapshot();
  if (costWarning) {
    output += costWarning;
  }

  output += `\n💡 **Tip:** Use the \`get_collection\` tool to view collection details.\n`;
  
  return output;
}

/**
 * Format collection details
 */
function formatCollectionDetails(response: GetCollectionResponse): string {
  const { collection } = response;
  
  let output = `📚 **Collection Details**\n\n`;
  output += `**Name:** ${collection.name}\n`;
  output += `**ID:** ${collection.id}\n`;
  output += `**Icon Count:** ${collection.icon_count}\n\n`;
  
  output += `👤 **Creator:**\n`;
  output += `- Name: ${collection.creator.name}\n`;
  output += `- Username: @${collection.creator.username}\n`;
  output += `- Profile: https://thenounproject.com${collection.creator.permalink}\n\n`;
  
  if (collection.tags && collection.tags.length > 0) {
    output += `🏷️ **Tags:**\n${collection.tags.join(', ')}\n\n`;
  }
  
  if (collection.icons && collection.icons.length > 0) {
    output += `🎨 **Icons in Collection (showing ${collection.icons.length}):**\n\n`;
    
    collection.icons.forEach((icon, index) => {
      output += `${index + 1}. **${icon.term}** (ID: ${icon.id})\n`;
      output += `   - Style: ${icon.styles?.length ? icon.styles.map(s => s.style).join(', ') : 'unspecified'}\n`;
      if (icon.thumbnail_url) {
        output += `   - Thumbnail: ${icon.thumbnail_url}\n`;
      }
    });
    output += `\n`;
    
    // Pagination for icons
    if (collection.next_page || collection.prev_page) {
      output += `📖 **Icon Pagination:**\n`;
      if (collection.prev_page) output += `⬅️ Previous page: \`${collection.prev_page}\`\n`;
      if (collection.next_page) output += `➡️ Next page: \`${collection.next_page}\`\n`;
      output += `\n`;
    }
  }
  
  output += `🔗 **Permalink:** https://thenounproject.com${collection.permalink}\n\n`;

  const usageLine = formatUsageBrief(response.usage_limits ?? response);
  if (usageLine) {
    output += `📈 **${usageLine}**\n`;
  }

  return output;
}

/**
 * Format autocomplete results
 */
function formatAutocompleteResults(response: IconAutocompleteResponse): string {
  const { suggestions } = response;
  
  let output = `💡 **Autocomplete Suggestions**\n\n`;
  
  if (suggestions.length === 0) {
    output += `❌ No suggestions found.\n`;
    return output;
  }
  
  output += `${suggestions.length} suggestions:\n\n`;
  
  suggestions.forEach((suggestion, index) => {
    output += `${index + 1}. ${suggestion}\n`;
  });
  
  output += `\n`;
  const usageLine = formatUsageBrief(response.usage_limits ?? response);
  if (usageLine) {
    output += `📈 **${usageLine}**\n`;
  }

  output += `\n💡 **Tip:** Use one of these suggestions with \`search_icons\` to search.\n`;
  
  return output;
}
