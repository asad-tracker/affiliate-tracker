function replaceTokens(template, values = {}) {
  return template.replace(/\{(\w+)\}/g, (_, key) => {
    return values[key] !== undefined ? values[key] : '';
  });
}

module.exports = { replaceTokens };