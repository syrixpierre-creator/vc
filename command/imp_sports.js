/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for sports.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "sports.js",
  family: "B",
  command: "sports",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "sports",
  aliases: [],
  category: "restored",
  description: "Restored: sports",
  usage: ".sports",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
