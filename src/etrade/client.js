import { apiGet, apiPost, hasValidAccessToken } from './oauth.js';

class ETradeClient {
  async request(endpoint, method = 'GET', body = null, params = null) {
    if (!hasValidAccessToken()) {
      throw new Error('Not authenticated. Run: npm run auth');
    }

    if (method === 'GET') {
      return apiGet(endpoint, params);
    } else if (method === 'POST') {
      return apiPost(endpoint, body);
    }

    throw new Error(`Unsupported method: ${method}`);
  }

  // Get options chain for a symbol
  // options: { expiryYear, expiryMonth, expiryDay, strikePriceNear, noOfStrikes, chainType }
  async getOptionsChain(symbol, options = {}) {
    const params = { symbol, ...options };
    return this.request('/v1/market/optionchains.json', 'GET', null, params);
  }

  // Get option expiry dates for a symbol
  async getOptionExpiries(symbol) {
    return this.request('/v1/market/optionexpiredate.json', 'GET', null, { symbol });
  }

  // Get quote for symbol(s)
  async getQuote(symbols) {
    const symbolList = Array.isArray(symbols) ? symbols.join(',') : symbols;
    return this.request(`/v1/market/quote/${symbolList}.json`);
  }

  // Get account list
  async getAccounts() {
    return this.request('/v1/accounts/list.json');
  }

  // Get account balance
  async getAccountBalance(accountIdKey) {
    return this.request(`/v1/accounts/${accountIdKey}/balance.json`, 'GET', null, {
      instType: 'BROKERAGE',
      realTimeNAV: 'true'
    });
  }

  // Get account positions
  async getPositions(accountIdKey) {
    return this.request(`/v1/accounts/${accountIdKey}/portfolio.json`);
  }
}

export const etradeClient = new ETradeClient();
