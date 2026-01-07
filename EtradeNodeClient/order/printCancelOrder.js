const { format } = require('util');
const error = require('../utils/error');

function printCancelOrder(inData) {
  try {
    const { orderId } = inData.body.CancelOrderResponse;
    const str = format('Order Number #%s successfully Cancelled.', orderId);
    console.log(str);
  } catch (err) {
    error(`Error on Cancel Order response data format: ${err}`, true);
  }
}
module.exports = printCancelOrder;
