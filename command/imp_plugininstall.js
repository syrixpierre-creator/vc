/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pluginInstall.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pluginInstall.js",
  family: "A",
  command: "plugininstall",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "plugininstall",
  aliases: [],
  category: "restored",
  description: "Restored: pluginInstall",
  usage: ".plugininstall",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
