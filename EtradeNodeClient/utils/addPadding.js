function addPadding(item, colLen) {
  const itemStr = `${item}`;
  const paddingLen = colLen - itemStr.length;
  let padding = ' ';
  for (let i = 0; i < paddingLen; i++) { padding += ' '; }
  return padding;
}

module.exports = addPadding;
