const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const nextQuestion = (q) => {
  rl.setPrompt(q);
  rl.prompt();
};

module.exports = {
  rl,
  nextQuestion,
};
