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
        description: 'Search for icons on The Noun Project. You can filter by style, line weight, public domain, and more.',
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
        description: 'Get detailed information about a specific icon (metadata, creator, tags, download URLs).',
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
        description: 'Download an icon with custom color and size options. Supports SVG or PNG formats. Note: Free API access is limited to public domain icons only.',
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
        description: 'Search for collections on The Noun Project.',
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
        description: 'Get details and icons of a specific collection.',
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
        description: 'Get autocomplete suggestions for icon search.',
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
        description: 'Check API usage limits and current usage.',
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
