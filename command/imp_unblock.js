/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for unblock.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "unblock.js",
  family: "B",
  command: 'unblockalt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "unblock",
  aliases: [],
  category: "restored",
  description: "Restored: unblock",
  usage: ".unblock",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
