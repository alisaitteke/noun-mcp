#!/usr/bin/env node

/**
 * Noun MCP Server - The Noun Project MCP Server
 * 
 * MCP server for searching, downloading, and integrating The Noun Project
 * icons in Cursor AI, Claude, and other MCP-supported tools.
 * 
 * @author The Noun Project Contributors
 * @license MIT
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import dotenv from 'dotenv';
import { initializeFromEnv } from './api/auth.js';
import { initializeClient } from './api/client.js';
import { initializeCostOptimizer } from './utils/costOptimizer.js';

// Tool handlers
import { handleSearchIcons } from './tools/search.js';
import { handleGetIcon, handleDownloadIcon } from './tools/download.js';
import { handleSearchCollections, handleGetCollection, handleIconAutocomplete } from './tools/collections.js';
import { handleCheckUsage } from './tools/usage.js';

// Load .env file
dotenv.config();

/**
 * MCP Server instance
 */
const server = new Server(
  {
    name: '@alisaitteke/noun-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Return list of available tools
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: 'search_icons',
        description:
          'Search The Noun Project for icons. Returns IDs, style, license, thumbnails, tags, and attribution. This is a cheap *service* call — do NOT follow up with get_icon for every result. Use download_icon only when the user wants a file. Prefer a specific query over pagination (FREE trial: 2,000 service calls/month, 1,000/day).',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search term (e.g., "dog", "house", "bicycle")',
            },
            styles: {
              type: 'string',
              enum: ['solid', 'line', 'solid,line'],
              description: 'Icon style: solid, line, or both',
            },
            line_weight: {
              type: ['number', 'string'],
              description: 'Line weight for line icons (1-60) or range (e.g., "18-20")',
            },
            limit_to_public_domain: {
              type: 'number',
              enum: [0, 1],
              description: 'Show only public domain icons (1=yes, 0=no)',
            },
            thumbnail_size: {
              type: 'number',
              enum: [42, 84, 200],
              description: 'Thumbnail size in pixels',
            },
            include_svg: {
              type: 'number',
              enum: [0, 1],
              description: 'Include SVG URLs in response (1=yes, 0=no)',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
            },
            next_page: {
              type: 'string',
              description: 'Token for next page',
            },
            prev_page: {
              type: 'string',
              description: 'Token for previous page',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_icon',
        description:
          'Get extra details for one icon, including a temporary SVG icon_url (expires in 1 hour). This is an expensive *icon* call (FREE trial: 150/day and 150/month). Skip it when search_icons already has the metadata you need.',
        inputSchema: {
          type: 'object',
          properties: {
            icon_id: {
              type: 'number',
              description: 'Unique icon ID',
            },
            thumbnail_size: {
              type: 'number',
              enum: [42, 84, 200],
              description: 'Thumbnail size in pixels',
            },
          },
          required: ['icon_id'],
        },
      },
      {
        name: 'download_icon',
        description:
          'Download one icon as SVG or PNG (optional color/size; FREE trial is public-domain only). This is an expensive *icon* call (150/day on the free trial). Use only when the user asked to save or embed the file, not to inspect search results.',
        inputSchema: {
          type: 'object',
          properties: {
            icon_id: {
              type: 'number',
              description: 'ID of the icon to download',
            },
            color: {
              type: 'string',
              description: 'Hexadecimal color value (e.g., "FF0000" for red)',
            },
            filetype: {
              type: 'string',
              enum: ['svg', 'png'],
              description: 'File format (svg or png)',
            },
            size: {
              type: 'number',
              description: 'Size in pixels for PNG (min: 20, max: 1200). Not applicable for SVG.',
            },
            save_to_file: {
              type: 'string',
              description: 'Optional: File path to save the icon',
            },
          },
          required: ['icon_id'],
        },
      },
      {
        name: 'search_collections',
        description: 'Search Noun Project collections (icon sets). Service call — cheaper than get_icon/download_icon.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Collection search term',
            },
            limit: {
              type: 'number',
              description: 'Maximum number of results',
            },
            next_page: {
              type: 'string',
              description: 'Token for next page',
            },
            prev_page: {
              type: 'string',
              description: 'Token for previous page',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'get_collection',
        description: 'Get a collection and a page of its icons. Service call. Prefer this over calling get_icon on each member.',
        inputSchema: {
          type: 'object',
          properties: {
            collection_id: {
              type: 'number',
              description: 'Unique collection ID',
            },
            thumbnail_size: {
              type: 'number',
              enum: [42, 84, 200],
              description: 'Thumbnail size in pixels',
            },
            include_svg: {
              type: 'number',
              enum: [0, 1],
              description: 'Include SVG URLs',
            },
            limit: {
              type: 'number',
              description: 'Icon limit in collection',
            },
            next_page: {
              type: 'string',
              description: 'Token for next page',
            },
            prev_page: {
              type: 'string',
              description: 'Token for previous page',
            },
          },
          required: ['collection_id'],
        },
      },
      {
        name: 'icon_autocomplete',
        description: 'Autocomplete icon search terms (max 10). Cheap service call — use before searching if the query is ambiguous.',
        inputSchema: {
          type: 'object',
          properties: {
            query: {
              type: 'string',
              description: 'Search term for autocomplete',
            },
            limit: {
              type: 'number',
              description: 'Number of suggestions (maximum 10)',
            },
          },
          required: ['query'],
        },
      },
      {
        name: 'check_usage',
        description:
          'Show current API usage vs limits for hourly, daily, and monthly windows, split into service calls vs icon calls. Cached for 5 minutes.',
        inputSchema: {
          type: 'object',
          properties: {},
        },
      },
    ],
  };
});

/**
 * Handle tool calls
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'search_icons':
        return await handleSearchIcons(args);
      
      case 'get_icon':
        return await handleGetIcon(args);
      
      case 'download_icon':
        return await handleDownloadIcon(args);
      
      case 'search_collections':
        return await handleSearchCollections(args);
      
      case 'get_collection':
        return await handleGetCollection(args);
      
      case 'icon_autocomplete':
        return await handleIconAutocomplete(args);
      
      case 'check_usage':
        return await handleCheckUsage(args);
      
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    
    return {
      content: [
        {
          type: 'text',
          text: `❌ Error: ${errorMessage}`,
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  try {
    // Initialize cost optimizer
    console.error('⚙️  Initializing cost optimizer...');
    initializeCostOptimizer();
    
    // Initialize OAuth and API client
    console.error('🔐 Initializing OAuth authentication...');
    initializeFromEnv();
    
    console.error('🌐 Initializing API client...');
    initializeClient();
    
    console.error('✅ Noun MCP Server ready!');
    
    // Connect via stdio transport
    const transport = new StdioServerTransport();
    await server.connect(transport);
    
    console.error('🚀 Server successfully started and connected.');
  } catch (error) {
    console.error('❌ Server initialization error:', error);
    process.exit(1);
  }
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('❌ Unhandled promise rejection:', reason);
  process.exit(1);
});

// Start the server
main();
