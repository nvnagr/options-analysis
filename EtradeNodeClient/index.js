const minimist = require('minimist');
const error = require('./utils/error');

const defConfigFile = 'config.ini';

module.exports = () => {
  const args = minimist(process.argv.slice(2));
  let cmd = args._[0] || 'main';

  if (args.version || args.v) {
    cmd = 'version';
  }

  if (args.help || args.h) {
    cmd = 'help';
  }

  if (args.config || args.c) {
    cmd = 'config';
  }

  switch (cmd) {
    case 'version':
      require('./cmds/version')(args);
      break;

    case 'help':
      require('./cmds/help')(args);
      break;

    case 'config':
      require('./cmds/config')(args);
      break;

    case 'main':
    default:
      require('./main/main')(defConfigFile);
      break;
  }
};
