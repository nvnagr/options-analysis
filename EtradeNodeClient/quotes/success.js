const session = require('../utils/session');
const printQuote = require('./printQuote');
const quoteError = require('./error');
const logger = require('../utils/logger');
const next = require('../main/next');

function quoteSuccess(resp) {
  logger.info(`Quote response body: ${JSON.stringify(resp.body, null, 4)}`);
  printQuote(resp.body);
  next('market', '0', 'market', true);
}

module.exports = quoteSuccess;
