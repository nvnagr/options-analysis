const open = require('open');
const session = require('../utils/session');
const logger = require('../utils/logger');
const error = require('../utils/error');
const validKeyType = require('../utils/validKeyType');
const next = require('./next');
const balanceFetch = require('../accounts/balance');
const portfolioFetch = require('../accounts/portfolio');
const viewOrder = require('../order/viewOrder');
const cancelOrder = require('../order/cancelOrder');
const previewOrder = require('../order/previewOrder');
const viewOpenOrder = require('../order/viewOpenOrder');
const getAcctContext = require('../accounts/getAcctContext');
const quoteFetch = require('../quotes/quote');
const { oauthAcctFetch, acctFetch } = require('../accounts/account');

const reqTokenFail = (err) => {
  console.log(`Request Token Failed -- Error is ${JSON.stringify(err)}`);
};

const reqTokenSuccess = (resp) => {
  const authorizeUrl = session.getAuthorizeUrl(resp.token);
  const keyType = session.getKeyType();

  session.setItem('reqToken', resp.token);
  session.setItem('reqTokenSecret', resp.tokenSecret);
  open(authorizeUrl);
  next('top', keyType, 'oauth', false);
};

function authorization() {
  const etradeClient = session.createEtradeClient();
  const response = etradeClient.requestToken({ oauth_callback: 'oob' });
  response.then(reqTokenSuccess, reqTokenFail);
}

function processMarket(input, errmsg1, errmsg2, context) {
  switch (input) {
    case '1':
      next('market', 'quote', 'quote', false);
      break;
    case '2':
      if (context === 'marketOauth') {
        oauthAcctFetch();
      } else {
        acctFetch();
      }
      break;
    case '3':
      process.exit(0);
      break;
    default:
      error(errmsg1 + input + errmsg2, false);
      next('market', '0', 'marketOauth', true);
  }
}

function processTop(input, errmsg1, errmsg2) {
  if (validKeyType(input)) {
    const typeMap = { 1: 'sandbox', 2: 'live' };
    session.setKeyType(typeMap[input]);
    logger.info(`User key type is : ${typeMap[input]}`);
    authorization();
  } else {
    if (input === '3') {
      console.log('Bye!');
      process.exit(0);
    }
    error(errmsg1 + input + errmsg2, false);
    next('top', '0', 'top', true);
  }
}

function processOauth(input, errmsg1, errmsg2) {
  if (input.length !== 5) {
    error('Invalid verification code', true);
  } else {
    session.setItem('verifier', input);
    next('market', '0', 'marketOauth', true);
  }
}

function processAccount(input, errmsg1, errmsg2) {
  const idx = parseInt(input, 10);
  if (idx < session.getAcctListLength() && idx > 0) {
    session.setAcct(idx);
    const context = getAcctContext();
    next('account', 'option', context, true);
  } else if (idx === session.getAcctListLength()) {
    next('market', '0', 'market', true);
  } else {
    error(errmsg1 + input + errmsg2, false);
    next('account', '0', 'account', false);
  }
}

function processAcctBack(input, errmsg1, errmsg2) {
  if (input === '1') {
    acctFetch();
  } else {
    error(errmsg1 + input + errmsg2, false);
    next('account', 'option', 'acctBack', true);
  }
}

function processAcctAll(input, errmsg1, errmsg2) {
  if (input === '1') {
    balanceFetch();
  } else if (input === '2') {
    portfolioFetch();
  } else if (input === '3') {
    viewOrder('all');
  } else if (input === '4') {
    acctFetch();
  } else {
    error(errmsg1 + input + errmsg2, false);
    next('account', 'option', 'acctAll', true);
  }
}

function processAcctBalance(input, errmsg1, errmsg2) {
  if (input === '1') {
    balanceFetch();
  } else if (input === '2') {
    // go back
    acctFetch();
  } else {
    error(errmsg1 + input + errmsg2, false);
    next('account', 'option', 'acctBalance', true);
  }
}

function processOrder(input, errmsg1, errmsg2) {
  if (input === '1') {
    next('previewOrder', 'priceType', 'previewPriceType', true);
  } else if (input === '2') {
    // Cancel Order
    viewOpenOrder();
  } else {
  // back
    const context = getAcctContext();
    next('account', 'option', context, true);
  }
}

// handles input after picking cancelled
function processCancelOrder(input, errmsg1, errmsg2) {
  const idx = parseInt(input, 10);
  if (idx < session.getOpenOrderListLength() && idx > 0) { // pick cancel order
    const { orderId } = session.openOrderList[idx];
    cancelOrder(orderId);
  } else if (idx === session.getOpenOrderListLength()) { // go back
    next('order', '0', 'order', true);
  } else { // error
    error(errmsg1 + input + errmsg2, false);
    next('order', '0', 'order', true);
  }
}

function processPreviewPriceType(input, errmsg1, errmsg2) {
  const priceTypeOptions = ['MARKET', 'LIMIT'];
  session.order.price_type = priceTypeOptions[input - 1];
  session.order.client_order_id = Math.floor(Math.random() * (9999999999 - 1000000000)
      + 1000000000);

  if (session.order.price_type === 'MARKET') {
    session.order.order_term = 'GOOD_FOR_DAY';
    next('previewOrder', 'symbol', 'previewSymbol', false);
  } else {
    next('previewOrder', 'orderTerm', 'previewOrderTerm', true);
  }
}

function processPreviewOrderTerm(input, errmsg1, errmsg2) {
  const orderTermOptions = ['GOOD_FOR_DAY', 'IMMEDIATE_OR_CANCEL', 'FILL_OR_KILL'];
  session.order.order_term = orderTermOptions[input - 1];

  next('previewOrder', 'limitPrice', 'previewLimitPrice', false);
}

function processPreviewLimitPrice(input, errmsg1, errmsg2) {
  session.order.limit_price = input;
  next('previewOrder', 'symbol', 'previewSymbol', false);
}

function processPreviewSymbol(input, errmsg1, errmsg2) {
  session.order.symbol = input;
  next('previewOrder', 'orderAction', 'previewOrderAction', true);
}

function processPreviewOrderAction(input, errmsg1, errmsg2) {
  const orderActionOptions = ['BUY', 'SELL', 'BUY_TO_COVER', 'SELL_SHORT'];
  session.order.order_action = orderActionOptions[input - 1];
  next('previewOrder', 'quantity', 'previewQuantity', false);
}

function processPreviewQuantity(input, errmsg1, errmsg2) {
  session.order.quantity = input;
  previewOrder();
}

function processQuote(input) {
  quoteFetch(input);
}

const processContext = {
  top: processTop,
  oauth: processOauth,
  market: processMarket,
  marketOauth: processMarket,
  quote: processQuote,
  account: processAccount,
  acctBack: processAcctBack,
  acctAll: processAcctAll,
  acctBalance: processAcctBalance,
  order: processOrder,
  cancelOrder: processCancelOrder,
  previewPriceType: processPreviewPriceType,
  previewOrderTerm: processPreviewOrderTerm,
  previewLimitPrice: processPreviewLimitPrice,
  previewSymbol: processPreviewSymbol,
  previewOrderAction: processPreviewOrderAction,
  previewQuantity: processPreviewQuantity,
};

module.exports = processContext;
