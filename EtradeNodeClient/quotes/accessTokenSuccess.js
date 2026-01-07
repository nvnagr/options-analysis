const session = require('../utils/session');
const printQuote = require('./printQuote');
const quoteError = require('./error');
const logger = require('../utils/logger');
const menus = require('../menu/menus');
const quoteSuccess = require('./success');

const accessTokenSuccessQuote = (resp) => {
  const reqUrl = session.getQuoteUrl();
  const etradeClient = session.getEtradeClient();
  if (etradeClient !== null) {
    const authClient = etradeClient.auth(resp.token, resp.tokenSecret);
    session.setItem('authClient', authClient);
    logger.info(`API url: ${reqUrl}`);
    authClient.get(reqUrl).then(quoteSuccess, quoteError);
  } else {
    console.log('ERROR !! accessTokenSuccessQuote null etradeClient');
  }
};

module.exports = accessTokenSuccessQuote;
