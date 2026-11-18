/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pastebin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pastebin.js",
  family: "B",
  command: "xpastebin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xpastebin",
  aliases: [],
  category: "restored",
  description: "Restored: pastebin",
  usage: ".xpastebin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
