function getSpaceLen(i, len) {
  const retStr = `${i}`;
  return len - (retStr.length + 1);
}

function repeat(c, count) {
  const array = [];
  for (let i = 0; i < count;) array[i++] = c;
  return array.join('');
}

function getSpaceStr(i, len) {
  const n = getSpaceLen(i, len);
  return repeat(' ', n);
}

function printAcct(inData) {
  const resp = inData.body.AccountListResponse;
  const accounts = resp.Accounts.Account;
  let i = 0;
  const spaceLen = 7;
  const acctList = [{}];
  let s = ' ';

  console.log('Brokerage Account List:');
  accounts.forEach((data) => {
    i += 1;
    const id = data.accountId;
    const desc = (typeof data.accountDesc !== 'undefined') ? data.accountDesc : '';
    const type = (typeof data.institutionType !== 'undefined') ? data.institutionType : '';
    const sep = ', ';

    s = getSpaceStr(i, spaceLen);
    console.log(`${i})${s}${id}${sep}${desc}${sep}${type}`);
    acctList[i] = data;
  });

  i += 1;
  s = getSpaceStr(i, spaceLen);
  console.log(`${i})${s}Go Back`);
  return acctList;
}

module.exports = printAcct;
