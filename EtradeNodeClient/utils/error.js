const logger = require('./logger');

module.exports = (message, exit) => {
  logger.info(message);
  console.error(message);
  exit && process.exit(1);
};
