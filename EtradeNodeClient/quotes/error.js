const logger = require('../utils/logger');

function errorResponse(error) {
  logger.error(`Error: Quote API service error (${JSON.stringify(error, null, 4)})`);
  process.exit();
}

module.exports = errorResponse;
