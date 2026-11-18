const settings = require('../settings');
module.exports = {
  loadSettings: () => settings,
  getSettings: () => settings,
  saveSettings: () => true,
  updateSetting: () => true
};
