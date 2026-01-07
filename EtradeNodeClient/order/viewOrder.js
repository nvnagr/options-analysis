const error = require('../utils/error');
const logger = require('../utils/logger');
const session = require('../utils/session');
const printOrder = require('./printOrder');
const next = require('../main/next');

//
// Fetch order data
//
// URL : v1/accounts/{accountIdKey}/orders
//
//
const orderFetch = () => {
  const reqUrl = session.getOrderUrl();

  const authClient = session.getItem('authClient');
  const response = authClient.get(reqUrl);
  logger.info(`API url: ${reqUrl}`);

  response.then((resp) => {
    const { accountId } = session.getAcct();
    console.log(`All orders for selected account: ${accountId}\n`);
    logger.info(`Receive response from Order  \n${JSON.stringify(resp, null, 4)}`);
    if (resp.statusCode === 200) {
      printOrder(resp);
    } else if (resp.statusCode === 204) {
      console.log('None');
    } else {
      error(`Receive error from order: ${JSON.stringify(err)}`, true);
    }
    next('order', '0', 'order', true);
  }, (err) => {
    error(`Receive error from order: ${JSON.stringify(err)}`, true);
  });
};

module.exports = orderFetch;
