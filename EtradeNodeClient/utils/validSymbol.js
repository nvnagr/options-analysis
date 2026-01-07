function validSymbol(input) {
  let valid = true;
  const symlist = input;
  const symbols = symlist.replace(/\s/g, '');
  const syms = symbols.split(',');
  syms.forEach((s) => {
    const regExp = /^[A-Za-z]+$/;
    if ((!s.match(regExp)) || s.length > 5) {
      valid = false;
    }
  });
  return valid;
}

module.exports = validSymbol;
