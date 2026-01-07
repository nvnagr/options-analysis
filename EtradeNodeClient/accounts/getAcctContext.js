const session = require('../utils/session');

function getAcctContext() {
  const acct = session.getAcct();
  if (acct.institutionType === 'BROKERAGE') {
    return 'acctAll';
  } if (acct.institutionType === 'BANK') {
    return 'acctBalance';
  }
  return 'acctBack';
}

module.exports = getAcctContext;
