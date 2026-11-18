/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for unblockwa.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "unblockwa.js",
  family: "A",
  command: "unblockwa",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "unblockwa",
  aliases: [],
  category: "restored",
  description: "Restored: unblockwa",
  usage: ".unblockwa",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
