import { createRequire } from 'module';
import { ETRADE_CONFIG } from '../config.js';

// Use require for CommonJS E*TRADE OAuth client
const require = createRequire(import.meta.url);
const OAuth1Client = require('../../EtradeNodeClient/oauth/Client');

// Create authenticated E*TRADE client
let etradeClient = null;

export const getEtradeClient = () => {
  if (!etradeClient) {
    const baseUrl = ETRADE_CONFIG.baseUrl;
    const hostname = baseUrl.slice(8); // Remove 'https://'

    etradeClient = new OAuth1Client({
      key: ETRADE_CONFIG.consumerKey,
      secret: ETRADE_CONFIG.consumerSecret,
      callbackURL: 'oob',
      requestUrl: `${baseUrl}/oauth/request_token`,
      accessUrl: `${baseUrl}/oauth/access_token`,
      apiHostName: hostname,
    });
  }
  return etradeClient;
};

// Get authenticated client with stored tokens
export const getAuthenticatedClient = () => {
  if (!hasValidAccessToken()) {
    throw new Error('No valid access token. Run `npm run auth` first.');
  }

  const client = getEtradeClient();
  return client.auth({
    token: ETRADE_CONFIG.accessToken,
    secret: ETRADE_CONFIG.accessTokenSecret,
  });
};

export const hasValidAccessToken = () => {
  return ETRADE_CONFIG.accessToken && ETRADE_CONFIG.accessTokenSecret;
};

// Make authenticated GET request
// path should NOT include query params - pass them via params object
export const apiGet = async (path, params = null) => {
  const client = getAuthenticatedClient();
  const response = await client.get(path, null, params);
  return response.body;
};

// Make authenticated POST request
export const apiPost = async (path, body) => {
  const client = getAuthenticatedClient();
  const response = await client.post(path, JSON.stringify(body));
  return response.body;
};

// Make authenticated PUT request
export const apiPut = async (path, body) => {
  const client = getAuthenticatedClient();
  const response = await client.put(path, JSON.stringify(body));
  return response.body;
};

// Make authenticated DELETE request
export const apiDelete = async (path) => {
  const client = getAuthenticatedClient();
  const response = await client.delete(path);
  return response.body;
};
