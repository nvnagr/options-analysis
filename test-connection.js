#!/usr/bin/env node

/**
 * Test E*TRADE connection
 */

import { ETRADE_CONFIG, validateConfig } from './src/config.js';
import { hasValidAccessToken } from './src/etrade/oauth.js';
import { etradeClient } from './src/etrade/client.js';

console.log('=== E*TRADE Connection Test ===\n');

// Step 1: Check credentials
console.log('1. Checking API credentials...');
if (validateConfig()) {
  console.log('   ✓ Consumer key and secret are configured');
  console.log(`   Environment: ${ETRADE_CONFIG.environment}`);
  console.log(`   Base URL: ${ETRADE_CONFIG.baseUrl}`);
} else {
  console.log('   ✗ Missing API credentials');
  process.exit(1);
}

// Step 2: Check access tokens
console.log('\n2. Checking access tokens...');
if (hasValidAccessToken()) {
  console.log('   ✓ Access token is present');
} else {
  console.log('   ✗ No access token found');
  console.log('   Run: npm run auth');
  process.exit(1);
}

// Step 3: Test API call
console.log('\n3. Testing API connection...');
try {
  console.log('   Fetching accounts list...');
  const accounts = await etradeClient.getAccounts();
  console.log('   ✓ Successfully connected to E*TRADE API!');

  if (accounts?.AccountListResponse?.Accounts?.Account) {
    const accountList = accounts.AccountListResponse.Accounts.Account;
    console.log(`   Found ${accountList.length} account(s)`);
  }
} catch (error) {
  console.log('   ✗ API call failed:', error.message);

  if (error.message.includes('401') || error.message.includes('Unauthorized')) {
    console.log('\n   Your access token may have expired.');
    console.log('   Run: npm run auth');
  }
  process.exit(1);
}

// Step 4: Test market data (quote)
console.log('\n4. Testing market data access...');
try {
  console.log('   Fetching quote for AAPL...');
  const quote = await etradeClient.getQuote('AAPL');

  if (quote?.QuoteResponse?.QuoteData) {
    const data = quote.QuoteResponse.QuoteData[0];
    const price = data?.All?.lastTrade || data?.All?.lastPrice || 'N/A';
    console.log(`   ✓ AAPL last price: $${price}`);
  } else {
    console.log('   ✓ Quote request successful (response format may vary)');
  }
} catch (error) {
  console.log('   ✗ Quote request failed:', error.message);
}

console.log('\n=== Connection test complete ===');
