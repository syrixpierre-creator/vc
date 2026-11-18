/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_unblock.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_unblock.js",
  family: "A",
  command: "newunblock",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newunblock",
  aliases: [],
  category: "restored",
  description: "Restored: new_unblock",
  usage: ".newunblock",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
