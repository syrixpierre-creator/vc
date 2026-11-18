/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for a-menu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "a-menu.js",
  family: "B",
  command: "amenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "amenu",
  aliases: [],
  category: "restored",
  description: "Restored: a-menu",
  usage: ".amenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
