const session = require('../utils/session');
const accessTokenSuccessAcct = require('./success');
const accessTokenFail = require('../utils/accessTokenFail');
const logger = require('../utils/logger');
const printAcct = require('./printAcct');
const next = require('../main/next');
const error = require('../utils/error');

const oauthAcctFetch = () => {
  session.setItem('context', 'account');
  const etradeClient = session.getEtradeClient();
  const verifier = session.getItem('verifier');
  const reqToken = session.getItem('reqToken');
  const reqTokenSecret = session.getItem('reqTokenSecret');

  etradeClient.accessToken(reqToken, reqTokenSecret, verifier)
    .then(accessTokenSuccessAcct, accessTokenFail);
};

const acctFetch = () => {
  const reqUrl = session.getAcctUrl();
  const authClient = session.getItem('authClient');
  if (authClient !== null) {
    const response = authClient.get(reqUrl);
    logger.info(`API url: ${reqUrl}`);
    response.then((resp) => {
      logger.info(`Receive response from Accounts: \n${JSON.stringify(resp, null, 4)}`);
      const acctList = printAcct(resp);
      session.setAcctList(acctList);
      next('account', '0', 'account', false);
    }, (err) => {
      error(`Receive error from account:${JSON.stringify(err)}`, true);
    });
  } else {
    oauthAcctFetch();
  }
};

module.exports = {
  oauthAcctFetch,
  acctFetch,
};
