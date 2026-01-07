#!/usr/bin/env node
/**
 * Test script to fetch options data from E-Trade
 */

import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '.env') });

import { etradeClient } from './src/etrade/client.js';
import { hasValidAccessToken } from './src/etrade/oauth.js';

async function main() {
  console.log('Testing E-Trade MCP Server...\n');

  // Check authentication
  if (!hasValidAccessToken()) {
    console.error('Not authenticated. Run: npm run auth');
    process.exit(1);
  }
  console.log('✓ Access token found\n');

  const symbol = 'SPY'; // Using SPY as test symbol

  try {
    // First, get available expiry dates
    console.log(`Fetching option expiry dates for ${symbol}...`);
    const expiries = await etradeClient.getOptionExpiries(symbol);
    console.log('\nAvailable expiry dates:');
    console.log(JSON.stringify(expiries, null, 2));

    // Look for Jan 16th expiry
    console.log('\n--- Looking for January 16th, 2026 expiry ---\n');

    // Fetch options chain for Jan 16, 2026
    console.log('Fetching options chain for 2026-01-16...');
    const optionsChain = await etradeClient.getOptionsChain(symbol, {
      expiryYear: 2026,
      expiryMonth: 1,
      expiryDay: 16,
      noOfStrikes: 10,
      chainType: 'CALLPUT'
    });

    console.log('\nOptions Chain Response:');
    console.log(JSON.stringify(optionsChain, null, 2));

  } catch (error) {
    console.error('\nError:', error.message);
    if (error.response) {
      console.error('Response:', error.response);
    }
    process.exit(1);
  }
}

main();
