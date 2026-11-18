/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for Allmenu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "Allmenu.js",
  family: "B",
  command: "xallmenu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xallmenu",
  aliases: [],
  category: "restored",
  description: "Restored: Allmenu",
  usage: ".xallmenu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
