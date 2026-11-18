/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_arena.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_arena.js",
  family: "A",
  command: "newarena",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newarena",
  aliases: [],
  category: "restored",
  description: "Restored: new_arena",
  usage: ".newarena",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
