const winston = require('winston');
const { createLogger, format, transports } = require('winston');

const logger = createLogger({
  format: format.combine(
    format.label({ label: '[my-label]' }),
    format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss',
    }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [
    new winston.transports.Console({ level: 'error' }),
    new winston.transports.File({
      filename: './logs/EtradeNodeClient.log',
      level: 'info',
    }),
  ],
});

module.exports = logger;
