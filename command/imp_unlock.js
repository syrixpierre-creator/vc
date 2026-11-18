/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for unlock.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "unlock.js",
  family: "A",
  command: "unlock",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "unlock",
  aliases: [],
  category: "restored",
  description: "Restored: unlock",
  usage: ".unlock",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
