const logger = require('../utils/logger');
const session = require('../utils/session');
const printCancelOrder = require('./printCancelOrder');
const next = require('../main/next');
const error = require('../utils/error');
//
// cancel order
//
// URL : v1/accounts/{accountIdKey}/orders/cancel

const cancelOrder = (orderId) => {
  const reqUrl = session.getCancelOrderUrl();
  const authClient = session.getItem('authClient');
  const requestObject = `{"CancelOrderRequest":{"orderId":${orderId}}}`;
  const response = authClient.put(reqUrl, requestObject);
  logger.info(`API url: ${reqUrl}`);
  logger.info(`Request body: ${requestObject}`);

  response.then((resp) => {
    logger.info(`Receive response from Order  \n${JSON.stringify(resp, null, 4)}`);
    if (resp.statusCode === 200) {
      printCancelOrder(resp);
    } else {
      error(`Error processing cancel order statusCode:${resp.statusCode}`, false);
    }
    next('order', '0', 'order', true);
  }, (err) => {
    error(`Receive error from cancel order:${JSON.stringify(err)}`, false);
    next('order', '0', 'order', true);
  });
};

module.exports = cancelOrder;
