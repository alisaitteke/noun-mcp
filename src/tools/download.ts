/**
 * Icon detail and download tool handlers
 */

import { getIcon, downloadIcon } from '../api/client.js';
import { 
  GetIconInputSchema, 
  DownloadIconInputSchema,
  GetIconResponse,
  DownloadIconResponse 
} from '../types/schemas.js';
import fs from 'fs';
import path from 'path';

/**
 * get_icon tool handler
 * 
 * Retrieves detailed information about a specific icon.
 * 
 * @param args - Tool arguments
 * @returns MCP response with icon details
 */
export async function handleGetIcon(args: unknown) {
  // Input validation
  const input = GetIconInputSchema.parse(args);
  
  // API call
  const response: GetIconResponse = await getIcon(input.icon_id, input.thumbnail_size);
  
  // Format response
  const resultText = formatIconDetails(response);
  
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
 * download_icon tool handler
 * 
 * Downloads an icon with custom color and size options.
 * 
 * @param args - Tool arguments
 * @returns MCP response with download result
 */
export async function handleDownloadIcon(args: unknown) {
  // Input validation
  const input = DownloadIconInputSchema.parse(args);
  
  // API call
  const response: DownloadIconResponse = await downloadIcon(input.icon_id, {
    color: input.color,
    filetype: input.filetype,
    size: input.size,
  });
  
  // Save to file if requested
  if (input.save_to_file) {
    try {
      const fileBuffer = Buffer.from(response.base64_encoded_file, 'base64');
      const filePath = path.resolve(input.save_to_file);
      
      // Create directory if it doesn't exist
      const dir = path.dirname(filePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      
      fs.writeFileSync(filePath, fileBuffer);
      
      return {
        content: [
          {
            type: 'text',
            text: formatDownloadResultWithFile(response, filePath),
          },
        ],
      };
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      throw new Error(`Failed to save file: ${errorMsg}`);
    }
  }
  
  // Return base64 data
  const resultText = formatDownloadResult(response, input);
  
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
 * Format icon details
 */
function formatIconDetails(response: GetIconResponse): string {
  const { icon, usage_limits } = response;
  
  let output = `🎨 **Icon Details**\n\n`;
  output += `**Name:** ${icon.term}\n`;
  output += `**ID:** ${icon.id}\n`;
  output += `**Style:** ${icon.styles.map(s => s.style + (s.line_weight ? ` (weight: ${s.line_weight})` : '')).join(', ')}\n`;
  output += `**License:** ${icon.license_description}\n\n`;
  
  output += `👤 **Creator Information:**\n`;
  output += `- Name: ${icon.creator.name}\n`;
  output += `- Username: @${icon.creator.username}\n`;
  output += `- Profile: https://thenounproject.com${icon.creator.permalink}\n\n`;
  
  if (icon.tags && icon.tags.length > 0) {
    output += `🏷️ **Tags:**\n${icon.tags.join(', ')}\n\n`;
  }
  
  if (icon.collections && icon.collections.length > 0) {
    output += `📚 **Collections:**\n`;
    icon.collections.forEach(col => {
      output += `- ${col.name} (ID: ${col.id})\n`;
    });
    output += `\n`;
  }
  
  if (icon.thumbnail_url) {
    output += `🖼️ **Thumbnail URL:** ${icon.thumbnail_url}\n`;
  }
  
  if (icon.icon_url) {
    output += `📄 **SVG URL:** ${icon.icon_url}\n`;
    output += `⚠️ Note: SVG URLs are valid for 1 hour.\n`;
  }
  
  output += `🔗 **Permalink:** https://thenounproject.com${icon.permalink}\n`;
  output += `📝 **Attribution:** ${icon.attribution}\n\n`;
  
  output += `📈 **API Usage:** ${usage_limits.monthly.usage}/${usage_limits.monthly.limit} (monthly)\n\n`;
  
  output += `💡 **Tip:** Use the \`download_icon\` tool to download this icon.\n`;
  
  return output;
}

/**
 * Format download result
 */
function formatDownloadResult(response: DownloadIconResponse, input: any): string {
  const { content_type, usage_limits } = response;
  
  let output = `✅ **Icon Downloaded**\n\n`;
  output += `**Format:** ${content_type}\n`;
  
  if (input.color) {
    output += `**Color:** #${input.color}\n`;
  }
  
  if (input.size && input.filetype === 'png') {
    output += `**Size:** ${input.size}x${input.size}px\n`;
  }
  
  output += `\n📦 **Base64 Data URI:**\n`;
  output += `\`\`\`\n`;
  output += `data:${content_type};base64,${response.base64_encoded_file.substring(0, 100)}...\n`;
  output += `\`\`\`\n\n`;
  
  output += `📈 **API Usage:** ${usage_limits.monthly.usage}/${usage_limits.monthly.limit} (monthly)\n\n`;
  
  output += `💡 **Tip:** You can decode the base64 string to create the file.\n`;
  output += `Or use the \`save_to_file\` parameter to save directly to a file.\n`;
  
  return output;
}

/**
 * Format download result with saved file
 */
function formatDownloadResultWithFile(response: DownloadIconResponse, filePath: string): string {
  const { content_type, usage_limits } = response;
  
  let output = `✅ **Icon Successfully Saved**\n\n`;
  output += `**File:** ${filePath}\n`;
  output += `**Format:** ${content_type}\n`;
  output += `**Size:** ${Buffer.from(response.base64_encoded_file, 'base64').length} bytes\n\n`;
  
  output += `📈 **API Usage:** ${usage_limits.monthly.usage}/${usage_limits.monthly.limit} (monthly)\n\n`;
  
  output += `✨ Icon is now ready to use in your project!\n`;
  
  return output;
}
