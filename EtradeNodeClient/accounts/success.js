const session = require('../utils/session');
const printAcct = require('./printAcct');
const logger = require('../utils/logger');
const next = require('../main/next');

const accessTokenSuccessAcct = (accessToken) => {
  const reqUrl = session.getAcctUrl();
  const authClient = session.getEtradeClient().auth(accessToken.token, accessToken.tokenSecret);

  session.setItem('authClient', authClient);
  const response = authClient.get(reqUrl);
  response.then((resp) => {
    logger.info(`receive response from Accounts: \n${JSON.stringify(resp, null, 4)}`);
    const acctList = printAcct(resp);
    session.setAcctList(acctList);
    next('account', '0', 'account', false);
  }, (err) => {
    logger.error(`Error: Account API service error (${JSON.stringify(err)})`);
  });
};

module.exports = accessTokenSuccessAcct;
