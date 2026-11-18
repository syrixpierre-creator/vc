/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-ngl.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-ngl.js",
  family: "B",
  command: "makerngl",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerngl",
  aliases: [],
  category: "restored",
  description: "Restored: maker-ngl",
  usage: ".makerngl",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
