/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for menu-help.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "menu-help.js",
  family: "B",
  command: "menuhelp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "menuhelp",
  aliases: [],
  category: "restored",
  description: "Restored: menu-help",
  usage: ".menuhelp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
