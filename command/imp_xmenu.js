/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for menu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "menu.js",
  family: "A",
  command: "xmenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xmenu",
  aliases: [],
  category: "restored",
  description: "Restored: menu",
  usage: ".xmenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
