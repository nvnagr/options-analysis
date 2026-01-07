const error = require('./error');

function validKeyType(type) {
  switch (type) {
    case '1': // sandbox
    case '2': // live
      return true;
    case '3':
      return false;
    default:
      return false;
  }
  return false;
}

module.exports = validKeyType;
