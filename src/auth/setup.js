#!/usr/bin/env node

/**
 * E*TRADE OAuth Setup
 * Using E*TRADE's official OAuth client
 */

import { createInterface } from 'readline';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

// Use require for CommonJS modules
const require = createRequire(import.meta.url);
const OAuth1Client = require('../../EtradeNodeClient/oauth/Client');

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, '..', '..', '.env');

// Load existing .env or create from example
function loadEnv() {
  if (!existsSync(envPath)) {
    const examplePath = join(__dirname, '..', '..', '.env.example');
    if (existsSync(examplePath)) {
      const example = readFileSync(examplePath, 'utf-8');
      writeFileSync(envPath, example);
      console.log('Created .env from .env.example');
    }
  }

  const env = {};
  if (existsSync(envPath)) {
    const content = readFileSync(envPath, 'utf-8');
    content.split('\n').forEach(line => {
      const [key, ...valueParts] = line.split('=');
      if (key && !key.startsWith('#')) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    });
  }
  return env;
}

function saveEnv(env) {
  const content = Object.entries(env)
    .map(([key, value]) => `${key}=${value}`)
    .join('\n');
  writeFileSync(envPath, content);
}

const rl = createInterface({
  input: process.stdin,
  output: process.stdout,
});

const question = (prompt) => new Promise((resolve) => rl.question(prompt, resolve));

async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗');
  console.log('║         E*TRADE OAuth Authentication Setup                 ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log();

  const env = loadEnv();

  // Check for consumer key/secret
  if (!env.ETRADE_CONSUMER_KEY || env.ETRADE_CONSUMER_KEY === 'your_consumer_key_here') {
    console.log('You need E*TRADE API credentials.');
    console.log('1. Go to https://developer.etrade.com/');
    console.log('2. Log in and create an application');
    console.log('3. Get your Consumer Key and Consumer Secret');
    console.log();

    env.ETRADE_CONSUMER_KEY = await question('Enter your Consumer Key: ');
    env.ETRADE_CONSUMER_SECRET = await question('Enter your Consumer Secret: ');
    env.ETRADE_ENV = await question('Environment (sandbox/production) [sandbox]: ') || 'sandbox';
    saveEnv(env);
  }

  const consumerKey = env.ETRADE_CONSUMER_KEY;
  const consumerSecret = env.ETRADE_CONSUMER_SECRET;
  const environment = env.ETRADE_ENV || 'sandbox';

  const baseUrl = environment === 'production'
    ? 'https://api.etrade.com'
    : 'https://apisb.etrade.com';

  const hostname = baseUrl.slice(8); // Remove 'https://'

  console.log();
  console.log(`Using ${environment} environment`);
  console.log(`Base URL: ${baseUrl}`);
  console.log('Starting OAuth flow...');
  console.log();

  // Create E*TRADE OAuth client using their official code
  const etradeClient = new OAuth1Client({
    key: consumerKey,
    secret: consumerSecret,
    callbackURL: 'oob',
    requestUrl: `${baseUrl}/oauth/request_token`,
    accessUrl: `${baseUrl}/oauth/access_token`,
    apiHostName: hostname,
  });

  try {
    // Step 1: Get Request Token
    console.log('Requesting token...');
    const requestTokenResult = await etradeClient.requestToken();

    const requestToken = requestTokenResult.token;
    const requestTokenSecret = requestTokenResult.tokenSecret;

    // Step 2: User authorization
    const authorizeUrl = `https://us.etrade.com/e/t/etws/authorize?key=${consumerKey}&token=${requestToken}`;

    console.log();
    console.log('Please visit this URL to authorize the application:');
    console.log();
    console.log(authorizeUrl);
    console.log();
    console.log('After authorizing, you will receive a verification code.');

    const verifier = await question('Enter the verification code: ');

    // Step 3: Get Access Token
    console.log();
    console.log('Exchanging for access token...');
    const accessTokenResult = await etradeClient.accessToken(
      requestToken,
      requestTokenSecret,
      verifier.trim()
    );

    // Save tokens
    env.ETRADE_ACCESS_TOKEN = accessTokenResult.token;
    env.ETRADE_ACCESS_TOKEN_SECRET = accessTokenResult.tokenSecret;
    saveEnv(env);

    console.log();
    console.log('Authentication successful!');
    console.log('Access tokens saved to .env');
    console.log();
    console.log('You can now use the MCP server with E*TRADE.');
    console.log('Note: Access tokens expire daily. Run this script again if needed.');

  } catch (error) {
    console.error();
    console.error('Authentication failed:', error.message || error);
    if (error.statusCode) {
      console.error('Status code:', error.statusCode);
    }
    if (error.data) {
      console.error('Response:', error.data);
    }
    console.error();
    console.error('Common issues:');
    console.error('- Invalid consumer key/secret');
    console.error('- Incorrect verification code');
    console.error('- Sandbox vs production mismatch');
  }

  rl.close();
}

main();
