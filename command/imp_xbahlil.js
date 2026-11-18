/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bahlil.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bahlil.js",
  family: "B",
  command: "xbahlil",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xbahlil",
  aliases: [],
  category: "restored",
  description: "Restored: bahlil",
  usage: ".xbahlil",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
