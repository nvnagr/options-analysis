const logger = require('../utils/logger');
const session = require('../utils/session');
const printPreviewOrder = require('./printPreviewOrder');
const next = require('../main/next');
const error = require('../utils/error');

const previewOrder = () => {
  const requestObject = `{"PreviewOrderRequest": {"orderType": "EQ","clientOrderId":${session.order.client_order_id},
  "Order": [{"allOrNone": "false","priceType": "${session.order.price_type}",
  "orderTerm":"${session.order.order_term}","marketSession": "REGULAR","limitPrice":${session.order.limit_price},
  "Instrument": [{"Product": {"securityType": "EQ","symbol":"${session.order.symbol}"},
  "orderAction":"${session.order.order_action}","quantityType": "QUANTITY", "quantity":${session.order.quantity}}]}]}}`;

  const reqUrl = session.getPreviewOrderUrl();
  const authClient = session.getItem('authClient');
  const response = authClient.post(reqUrl, requestObject);
  logger.info(`API url: ${reqUrl}`);
  logger.info(`Request body: ${requestObject}`);
  response.then((resp) => {
    logger.info(`Receive response from Order  \n${JSON.stringify(resp, null, 4)}`);
    if (resp.statusCode === 200) {
      printPreviewOrder(resp);
    } else if (resp.statusCode === 204) {
      error(`Error processing Preview Order statusCode:${resp.statusCode}`, false);
    } else {
      error(`Error processing Preview Order statusCode:${resp.statusCode}`, false);
    }
    next('order', '0', 'order', true);
  }).catch((err) => {
    error(`Receive error from preview order: ${JSON.stringify(err)}`, false);
    next('order', '0', 'order', true);
  });
};

module.exports = previewOrder;
