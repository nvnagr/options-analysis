const session = require('../utils/session');
const next = require('../main/next');
const logger = require('../utils/logger');
const printPortfolio = require('./printPortfolio');
const error = require('../utils/error');

const portfolioFetch = () => {
  const reqUrl = session.getPortfolioUrl();
  const authClient = session.getItem('authClient');
  const context = session.getItem('context');
  const response = authClient.get(reqUrl);
  logger.info(`API url: ${reqUrl}`);

  response.then((resp) => {
    // console.log(JSON.stringify(resp, null, 4));
    logger.info(`Receive response from Accounts Portfolio: \n${JSON.stringify(resp, null, 4)}`);
    printPortfolio(resp);
    next('account', 'option', context, true);
  }, (err) => {
    error(`Receive error from account portfolio: ${JSON.stringify(err)}`, true);
  });
};

module.exports = portfolioFetch;
