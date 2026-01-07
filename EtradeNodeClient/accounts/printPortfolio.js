const { format } = require('util');
const logger = require('../utils/logger');
const error = require('../utils/error');
const addPadding = require('../utils/addPadding');

function printPortfolio(inData) {
  console.log('\nPortfolio:');
  if (inData.statusCode === 200) {
    try {
      const portfolios = inData.body.PortfolioResponse.AccountPortfolio;
      portfolios.forEach((p) => {
        if (typeof p.Position !== 'undefined') {
          const positions = p.Position;
          for (let i = 0; i < positions.length; i++) {
            const pos = positions[i];
            let sym; let qnty; let lastTrade; let pricePaid; let totalGain; let val; let
              tmp = '';
            if (typeof pos.symbolDescription !== 'undefined') {
              sym = pos.symbolDescription + addPadding(pos.symbolDescription, 6);
            }
            if (typeof pos.quantity !== 'undefined') {
              qnty = pos.quantity + addPadding(pos.quantity, 10);
            }
            if (typeof pos.Quick.lastTrade !== 'undefined') {
              tmp = pos.Quick.lastTrade.toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
              lastTrade = `$${tmp}${addPadding(tmp, 10)}`;
            }
            if (typeof pos.pricePaid !== 'undefined') {
              tmp = pos.pricePaid.toLocaleString('en-us', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
              pricePaid = `$${tmp}${addPadding(tmp, 10)}`;
            }
            if (typeof pos.totalGain !== 'undefined') {
              tmp = pos.totalGain.toLocaleString('en-us', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 });
              totalGain = `$${tmp}${addPadding(tmp, 10)}`;
            }
            if (typeof pos.marketValue !== 'undeifned') {
              val = `$${pos.marketValue.toLocaleString('en-us', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 })}`;
            }
            const out = format('Symbol: %s| Quantity #: %s| Last Price: %s| Price Paid: %s| Total Gain: %s| Value: %s', sym, qnty, lastTrade, pricePaid, totalGain, val);
            console.log(out);
          }
        }
      });
    } catch (err) {
      logger.error(`printPortfolio data error: ${err}`, true);
    }
  } else if (inData.statusCode === 204) {
    console.log('None');
  } else {
    error('Error: Portfolio API service error', true);
  }
}

module.exports = printPortfolio;
