const error = require('../utils/error');

function printPreviewOrder(inData) {
  try {
    const previewIds = inData.body.PreviewOrderResponse.PreviewIds;
    previewIds.forEach((data) => {
      console.log('\nPreview ID: ', data.previewId);
    });

    const order = inData.body.PreviewOrderResponse.Order;

    order.forEach((orders) => {
      orders.Instrument.forEach((instruments) => {
        console.log(`Action: ${instruments.orderAction}`);
        console.log(`Quantity: ${instruments.quantity}`);
        console.log(`Symbol: ${instruments.Product.symbol}`);
        console.log(`Description: ${instruments.symbolDescription}`);
      });

      console.log(`Price Type: ${orders.priceType}`);
      if (orders.priceType == 'MARKET') {
        console.log('Price: MKT');
      } else {
        console.log(`Price: ${orders.limitPrice}`);
      }
      console.log(`Order Term: ${orders.orderTerm}`);
      console.log(`Estimated Commission: ${orders.estimatedCommission}`);
      console.log(`Estimated Total Cost: ${orders.estimatedTotalAmount}`);
    });
  } catch (err) {
    error(`Error on order response data format: ${err}`, true);
  }
}
module.exports = printPreviewOrder;
