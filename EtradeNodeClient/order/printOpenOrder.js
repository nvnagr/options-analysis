const { format } = require('util');
const error = require('../utils/error');
const addPadding = require('../utils/addPadding');

function printOrders(inData) {
  try {
    const orders = inData.body.OrdersResponse.Order;
    let str = '';
    let i = 0;
    const openOrderList = [{}];

    orders.forEach((data) => {
      i += 1;
      const details = data.OrderDetail[0];
      const instrument = details.Instrument[0];
      const d = new Date(details.placedTime);
      const dateStr = d.toLocaleDateString() + addPadding(d.toLocaleDateString(), 10);
      const id = data.orderId + addPadding(data.orderId, 4);
      const otype = (typeof data.orderType !== 'undefined') ? data.orderType + addPadding(data.orderType, 16) : addPadding('--', 18);
      const action = instrument.orderAction + addPadding(instrument.orderAction, 11);
      const qnty = instrument.orderedQuantity + addPadding(instrument.orderedQuantity, 8);
      const sym = instrument.Product.symbol + addPadding(instrument.Product.symbol, 6);
      const priceType = details.priceType + addPadding(details.priceType, 19);
      // const term = details.orderTerm + addPadding(details.orderTerm, 8);
      const executed = (typeof instrument.averageExecutionPrice !== 'undefined') ? `$${instrument.averageExecutionPrice.toLocaleString()}` : '--';
      const status = details.status + addPadding(details.status, 8);
      str = format('%s)  Date: %s| OrderId: %s| OrderType: %s| Action: %s| Quantity: %s| Symbol: %s| PriceType: %s| Status: %s| PriceExecuted: %s', i, dateStr, id, otype, action, qnty, sym, priceType, status, executed);

      openOrderList[i] = data;
      console.log(str);
    });
    i += 1;
    console.log(`${i})\tGo Back`);
    return openOrderList;
  } catch (err) {
    error(`Error on order response data format: ${err}`, true);
  }
}
module.exports = printOrders;
