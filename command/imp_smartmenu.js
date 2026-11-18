/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for smartmenu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "smartmenu.js",
  family: "A",
  command: "smartmenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "smartmenu",
  aliases: [],
  category: "restored",
  description: "Restored: smartmenu",
  usage: ".smartmenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
