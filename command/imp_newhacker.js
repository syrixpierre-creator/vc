/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_hacker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_hacker.js",
  family: "A",
  command: "newhacker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newhacker",
  aliases: [],
  category: "restored",
  description: "Restored: new_hacker",
  usage: ".newhacker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
