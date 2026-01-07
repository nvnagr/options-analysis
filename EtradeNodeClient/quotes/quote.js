const validSymbol = require('../utils/validSymbol');
const session = require('../utils/session');
const logger = require('../utils/logger');
const printQuote = require('./printQuote');
const next = require('../main/next');
const accessTokenSuccessQuote = require('./accessTokenSuccess');
const accessTokenFail = require('../utils/accessTokenFail');
const error = require('../utils/error');

//
// quote URL: v1/market/quote/{symbols}
//
const quoteFetch = (symbol) => {
  if (validSymbol(symbol)) {
    const reqUrl = `${session.getQuoteUri() + symbol}.json`;
    const authClient = session.getItem('authClient');
    if (authClient !== null) {
      // accessToken exists
      const response = authClient.get(reqUrl);
      logger.info(`API url: ${reqUrl}`);
      response.then((resp) => {
        logger.info(`Receive response from Quotes: \n${JSON.stringify(resp, null, 4)}`);
        printQuote(resp.body);
        next('market', '0', 'market', true);
      }, (err) => {
        error(`Receive error from quote:${JSON.stringify(err)}`, true);
      });
    } else {
      // using request Token to get accessToken
      const etradeClient = session.getEtradeClient();
      const verifier = session.getItem('verifier');
      const reqToken = session.getItem('reqToken');
      const reqTokenSecret = session.getItem('reqTokenSecret');
      session.setQuoteUrl(reqUrl);
      etradeClient.accessToken(reqToken, reqTokenSecret, verifier)
        .then(accessTokenSuccessQuote, accessTokenFail);
    }
  } else {
    error(`Not a valid symbol: ${symbol}`, false);
    next('market', 'quote', 'quote', false);
  }
};

module.exports = quoteFetch;
