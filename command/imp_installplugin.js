/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for installplugin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "installplugin.js",
  family: "A",
  command: "installplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "installplugin",
  aliases: [],
  category: "restored",
  description: "Restored: installplugin",
  usage: ".installplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
