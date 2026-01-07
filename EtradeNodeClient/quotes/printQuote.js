const error = require('../utils/error');

function printMsg(resp) {
  const errmsg = resp.Message[0];
  if ((typeof errmsg.type !== 'undefined') && (typeof errmsg.description !== 'undefined')) {
    error(`${errmsg.type} : ${errmsg.description}`, false);
  }
}

function printQuote(data) {
  const response = data.QuoteResponse;

  if (typeof response.Messages !== 'undefined') {
    printMsg(response.Messages);
    return;
  }

  const resp = data.QuoteResponse.QuoteData;

  resp.forEach((data) => {
    if (typeof data.dateTIme !== 'undefined') { console.log(`\nDate TIme: ${data.dateTime}`); }
    if (typeof data.Product !== 'undefined') {
      console.log(`Symbol: ${data.Product.symbol}`);
      console.log(`Security Type: ${data.Product.securityType}`);
    }
    if (typeof data.All !== 'undefined') {
      console.log(`Last price: ${data.All.lastTrade}`);
      console.log(`Today's Change: ${data.All.changeClose.toFixed(3)} (${data.All.changeClosePercentage}%)`);
      console.log(`Open: ${data.All.open.toFixed(2)}`);
      console.log(`Previous Close: ${data.All.previousClose.toFixed(2)}`);
      console.log(`Bid (Size): ${data.All.bid.toFixed(2)}x${data.All.bidSize}`);
      console.log(`Ask (Size): ${data.All.ask.toFixed(2)}x${data.All.askSize}`);
      console.log(`Day's Range: ${data.All.low.toFixed(2)}-${data.All.high.toFixed(2)}`);
      console.log(`Volume: ${data.All.totalVolume.toLocaleString()}`);
    }
  });
}

module.exports = printQuote;
