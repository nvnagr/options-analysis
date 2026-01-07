#!/usr/bin/env node

/**
 * Options Analysis MCP Server
 * Connects to E*TRADE for real-time options data and provides analysis tools
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { validateConfig } from './config.js';
import { tools, handleToolCall } from './tools/index.js';
import { hasValidAccessToken } from './etrade/oauth.js';

// Create MCP server
const server = new Server(
  {
    name: 'options-analysis',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    // Check if E*TRADE tools need authentication
    const etradeTools = ['get_options_chain', 'get_option_expiries', 'get_quote', 'get_accounts', 'get_positions'];
    if (etradeTools.includes(name) && !hasValidAccessToken()) {
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: 'Not authenticated with E*TRADE',
              message: 'Run "npm run auth" in the options-analysis directory to authenticate.',
            }, null, 2),
          },
        ],
      };
    }

    const result = await handleToolCall(name, args);

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(result, null, 2),
        },
      ],
    };
  } catch (error) {
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({
            error: error.message,
            tool: name,
            args,
          }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

// Start server
async function main() {
  // Validate configuration
  if (!validateConfig()) {
    console.error('Configuration validation failed. See above for details.');
    // Continue anyway - some tools work without E*TRADE
  }

  if (!hasValidAccessToken()) {
    console.error('No E*TRADE access token. Run "npm run auth" to authenticate.');
    console.error('Greeks calculation and strategy analysis will still work.');
  }

  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Options Analysis MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
