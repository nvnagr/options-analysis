const OAuth1Client = require('../oauth/Client');

const session = {
  current: null,
  keyType: '',
  authClient: null,
  verifier: '',
  etradeClient: null,
  openOrderList: [{}],
  sandbox: { consumerKey: '', consumerSecret: '', baseUrl: '' },
  live: { consumerKey: '', consumerSecret: '', baseUrl: '' },
  oauth: { authorizeUrl: '', accessUrl: '', tokenUrl: '' },
  order: {
    price_type: '', order_term: '', symbol: '', order_action: '', limit_price: 0, quantity: '',
  },
  api: {
    accountListUri: '', balanceUri: '', portfolioUri: '', quoteUri: '', accountsUri: '',
  },
  credentials: {},
  setCredentials(token, tokenSecret) {
    this.credentials.token = token;
    this.credentials.tokenSecret = tokenSecret;
  },
  getCredentials() {
    return this.credentials;
  },
  createEtradeClient() {
    const key = session.getConsumerKey();
    const secret = session.getConsumerSecret();
    const baseUrl = session.getBaseUrl();
    const hostname = session.getHostName();

    session.etradeClient = new OAuth1Client({
      key,
      secret,
      callbackURL: 'oob',
      requestUrl: `${baseUrl}/oauth/request_token`,
      accessUrl: `${baseUrl}/oauth/access_token`,
      apiHostName: hostname,
    });

    return session.etradeClient;
  },
  getEtradeClient() {
    return session.etradeClient;
  },
  getConsumerKey() {
    const ret = (session.current !== null) ? session.current.consumerKey : null;
    return ret;
  },
  getConsumerSecret() {
    const ret = (session.current !== null) ? session.current.consumerSecret : null;
    return ret;
  },
  setVerifier(verifier) {
    session.verifier = verifier;
  },
  getVerifier(verifier) {
    return session.verifier;
  },
  setKeyType(type) {
    session.keyType = type;
    if (type === 'live') {
      session.current = session.live;
    } else if (type === 'sandbox') {
      session.current = session.sandbox;
    } else {
      session.current = session.live;
    }
  },
  getKeyType() {
    return session.keyType;
  },
  getBaseUrl() {
    return session[session.keyType].baseUrl;
  },
  getHostName() {
    const baseUrl = session.getBaseUrl();
    return baseUrl.slice(8);
  },
  getQuoteUri() {
    return session.api.quoteUri;
  },
  setQuoteUrl(url) {
    session.quoteUrl = url;
  },
  getQuoteUrl(url) {
    return session.quoteUrl;
  },
  getAcctUrl() {
    return `${session.api.accountListUri}.json`;
  },
  getAuthorizeUrl(reqToken) {
    return (`${session.oauth.authorizeUrl}?key=${session.current.consumerKey}&token=${reqToken}`);
  },
  getBalanceUrl() {
    const acct = session.acctList[this.currentAcctIdx];
    return {
      url: `${session.api.accountsUri + acct.accountIdKey}/balance.json`,
      params: { instType: acct.institutionType, realTimeNAV: 'true' },
    };
  },
  getPortfolioUrl() {
    const acct = session.acctList[this.currentAcctIdx];

    return `${session.api.accountsUri + acct.accountIdKey}/portfolio.json`;
  },
  getCancelOrderUrl() {
    const acct = session.acctList[this.currentAcctIdx];

    return `${session.api.accountsUri + acct.accountIdKey}/orders/cancel.json`;
  },
  getPreviewOrderUrl() {
    const acct = session.acctList[this.currentAcctIdx];

    return `${session.api.accountsUri + acct.accountIdKey}/orders/preview.json`;
  },
  getOrderUrl() {
    const acct = session.acctList[this.currentAcctIdx];

    return `${session.api.accountsUri + acct.accountIdKey}/orders.json`;
  },
  setAcct(idx) {
    session.currentAcctIdx = idx;
  },
  getAcct(idx) {
    if (typeof idx === 'undefined') return session.acctList[session.currentAcctIdx];
    return session.acctList[idx];
  },
  getAcctIdx() {
    return session.currentAcctIdx;
  },
  setAcctList(list) {
    session.acctList = list;
  },
  getAcctListLength() {
    return session.acctList.length;
  },
  setOpenOrderList(list) {
    session.openOrderList = list;
  },
  getOpenOrderListLength() {
    return session.openOrderList.length;
  },
  setItem(name, content) {
    session[name] = content;
  },
  getItem(name) {
    return session[name];
  },
  /*
  getReqUrl: function(context) {
    let ctxt = (typeof context === 'undefined') ? session.context : context;
    switch (ctxt) {
      case 'quote':
        return session.getQuoteUrl();
      case 'account':
        return session.getAcctUrl();
      default:
        console.log("session: Unknown context !!");
        return '';
     }
  },
  */
  set(topic, name, content) {
    try {
      session[topic][name] = content;
      return true; // if set successfully
    } catch (err) {
      console.log(`Error on processing config: ${topic},${name},${content}`);
      return false;
    }
  },
};

module.exports = session;
