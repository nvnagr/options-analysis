const error = require('../utils/error');
const logger = require('../utils/logger');
const session = require('../utils/session');
const printOpenOrder = require('./printOpenOrder');
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
  const response = authClient.get(reqUrl, null, { status: 'OPEN' });
  logger.info(`API url: ${reqUrl}`);

  response.then((resp) => {
    console.log('\nOpen Orders:');
    logger.info(`Receive response from Order  \n${JSON.stringify(resp, null, 4)}`);
    if (resp.statusCode === 200) {
      const openOrderList = printOpenOrder(resp);
      session.setOpenOrderList(openOrderList);
      next('order', '0', 'cancelOrder', false);
    } else if (resp.statusCode === 204) {
      console.log('None');
      console.log('\n1)\tGo Back');
      next('order', '0', 'cancelOrder', false);
    } else {
      error(`Error processing statusCode:${resp.statusCode}`, true);
      next('order', '0', 'order', true);
    }
  }, (err) => {
    error(`Receive error from view order: ${JSON.stringify(err)}`, true);
  });
};

module.exports = orderFetch;
