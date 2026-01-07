import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
config({ path: join(__dirname, '..', '.env') });

export const ETRADE_CONFIG = {
  consumerKey: process.env.ETRADE_CONSUMER_KEY,
  consumerSecret: process.env.ETRADE_CONSUMER_SECRET,
  environment: process.env.ETRADE_ENV || 'sandbox',

  // API URLs
  get baseUrl() {
    return this.environment === 'production'
      ? 'https://api.etrade.com'
      : 'https://apisb.etrade.com';
  },

  get oauthUrl() {
    return this.environment === 'production'
      ? 'https://api.etrade.com/oauth'
      : 'https://apisb.etrade.com/oauth';
  },

  // Stored tokens
  accessToken: process.env.ETRADE_ACCESS_TOKEN,
  accessTokenSecret: process.env.ETRADE_ACCESS_TOKEN_SECRET,
};

export const validateConfig = () => {
  if (!ETRADE_CONFIG.consumerKey || !ETRADE_CONFIG.consumerSecret) {
    console.error('Missing E*TRADE API credentials!');
    console.error('1. Go to https://developer.etrade.com/ and register for API access');
    console.error('2. Copy .env.example to .env and fill in your credentials');
    return false;
  }
  return true;
};
