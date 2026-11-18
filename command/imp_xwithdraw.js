/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for withdraw.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "withdraw.js",
  family: "B",
  command: "xwithdraw",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xwithdraw",
  aliases: [],
  category: "restored",
  description: "Restored: withdraw",
  usage: ".xwithdraw",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
