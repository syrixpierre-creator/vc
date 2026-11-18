/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bfread.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bfread.js",
  family: "A",
  command: "bfread",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "bfread",
  aliases: [],
  category: "restored",
  description: "Restored: bfread",
  usage: ".bfread",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
