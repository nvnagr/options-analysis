const session = require('./session');

module.exports = (configFileName) => {
  let ret = true;
  try {
    require('fs').readFileSync(configFileName, 'utf-8').split(/\r?\n/).forEach((line) => {
      if ((line[0] !== '#') && (typeof line[0] !== 'undefined')) {
        const tmp = line.replace(/\s/g, '');
        const topic = tmp.split('=')[0].split('.')[0];
        const name = tmp.split('=')[0].split('.')[1];
        const content = tmp.split('=')[1];
        if (content === '') {
          console.log(`Missing ${topic} ${name}`);
          ret = false;
        }
        session.set(topic, name, content);
      }
    });
  } catch (e) {
    ret = false;
  }
  return ret;
};
