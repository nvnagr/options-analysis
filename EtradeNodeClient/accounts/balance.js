const session = require('../utils/session');
const next = require('../main/next');
const logger = require('../utils/logger');
const printBalance = require('./printBalance');
const error = require('../utils/error');

const balanceFetch = () => {
  const req = session.getBalanceUrl();
  const reqUrl = req.url;
  const { params } = req;
  const authClient = session.getItem('authClient');
  const context = session.getItem('context');
  const response = authClient.get(reqUrl, null, params);
  logger.info(`API url: ${reqUrl}`);

  response.then((resp) => {
    logger.info(`Receive response from Accounts Balance: \n${JSON.stringify(resp, null, 4)}`);
    printBalance(resp);
    next('account', 'option', context, true);
  }, (err) => {
    error(`Receive error from account balance: ${JSON.stringify(err)}`, true);
  });
};
module.exports = balanceFetch;
