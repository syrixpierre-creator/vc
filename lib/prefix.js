let _prefix = '.';
module.exports = {
  getPrefix: () => _prefix,
  setPrefix: (p) => { _prefix = p || '.'; return _prefix; },
  prefix: () => _prefix
};
