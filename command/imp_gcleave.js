/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gcleave.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gcleave.js",
  family: "B",
  command: "gcleave",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gcleave",
  aliases: [],
  category: "restored",
  description: "Restored: gcleave",
  usage: ".gcleave",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
