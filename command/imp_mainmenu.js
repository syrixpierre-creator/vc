/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for main-menu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "main-menu.js",
  family: "B",
  command: "mainmenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "mainmenu",
  aliases: [],
  category: "restored",
  description: "Restored: main-menu",
  usage: ".mainmenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
