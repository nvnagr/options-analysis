const menus = {
  help: `
    EtradeNodeClient <options>

    version ............ show package version
    config <filename>.............using <filename> as config file
    help ............... show help menu`,
};

module.exports = (args) => {
  console.log(menus.help);
};
