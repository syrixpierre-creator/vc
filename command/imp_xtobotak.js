/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tobotak.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tobotak.js",
  family: "B",
  command: "xtobotak",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xtobotak",
  aliases: [],
  category: "restored",
  description: "Restored: tobotak",
  usage: ".xtobotak",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
