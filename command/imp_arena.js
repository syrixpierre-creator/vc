/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for arena.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "arena.js",
  family: "B",
  command: "arena",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "arena",
  aliases: [],
  category: "restored",
  description: "Restored: arena",
  usage: ".arena",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
