const error = require('../utils/error');

function printBank(resp) {
  if (typeof resp.Bank !== 'undefined') {
    console.log(`${'Total Account Value: ' + '$'}${resp.Bank.totalBalance}`);
  }
}

function printComputed(resp) {
  if (typeof resp.Computed !== 'undefined') {
    const compData = resp.Computed;
    if ((typeof compData.RealTimeValues !== 'undefined')
        && (typeof compData.RealTimeValues.totalAccountValue !== 'undefined')) {
      console.log(`${'Net Account Value: ' + '$'}${
        compData.RealTimeValues.totalAccountValue.toFixed(2)}`);
    }
    if (typeof compData.marginBuyingPower !== 'undefined') {
      console.log(`${'Margin Buying Power: ' + '$'}${
        compData.marginBuyingPower.toFixed(2)}`);
    }
    if (typeof compData.cashBuyingPower !== 'undefined') {
      console.log(`${'Cash Buying Power: ' + '$'}${
        compData.cashBuyingPower}`);
    }
  }
}

function printBalance(inData) {
  try {
    const resp = inData.body.BalanceResponse;
    if (typeof resp.accountId === 'undefined') {
      console.log('\n\nBalance:');
    } else {
      console.log(`\n\nBalance for ${resp.accountId}:`);
    }
    if (typeof resp.accountDescription !== 'undefined') {
      console.log(`Account Nickname: ${resp.accountDescription}`);
    }
    printComputed(resp);
    printBank(resp);
  } catch (err) {
    error(`Accounts Balance API error on printBalance: ${err}`, true);
  }
}

module.exports = printBalance;
