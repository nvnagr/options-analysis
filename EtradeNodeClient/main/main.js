const readConfig = require('../utils/readConfig');
const session = require('../utils/session');
const logger = require('../utils/logger');
const input = require('../utils/input');
const error = require('../utils/error');
const next = require('./next');
const processContext = require('./processContext');

process.on('unhandledRejection', (error) => {
  console.log('unhandledRejection', error.test);
  process.exit();
});

function loop() {
  const errmsg1 = 'Not a valid option: ';
  const errmsg2 = ', Please try again';

  input.rl.on('line', (line) => {
    const context = session.getItem('context');
    const inputs = line.trim();
    if (typeof processContext[context] === 'function') {
      processContext[context](inputs, errmsg1, errmsg2, context);
    } else {
      error(`Unknown input: ${inputs}`, false);
    }
  }).on('close', () => {
    console.log('Bye!');
    process.exit(0);
  });
}

function main(fname) {
  logger.info(`Started EtradeNodeCLient app using config file: ${fname}`);
  if (!readConfig(fname)) {
    error(`Error processing config file: ${fname}`, true);
  }
  // set context as top and ask user input accordingly
  next('top', '0', 'top', true);
  // loop user input to fetch API data
  loop();
}

module.exports = main;
