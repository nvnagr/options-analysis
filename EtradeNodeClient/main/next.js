const menus = require('../menu/menus');
const question = require('../menu/question');
const input = require('../utils/input');
const session = require('../utils/session');

function next(first, second, context, showMenu) {
  if (showMenu) {
    console.log(menus[context]);
  }
  input.nextQuestion(question[first][second]);
  session.setItem('context', context);
}

module.exports = next;
