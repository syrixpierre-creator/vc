/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for addexp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "addexp.js",
  family: "A",
  command: "xaddexp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xaddexp",
  aliases: [],
  category: "restored",
  description: "Restored: addexp",
  usage: ".xaddexp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
