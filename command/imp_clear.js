/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for clear.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "clear.js",
  family: "A",
  command: "clear",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "clear",
  aliases: [],
  category: "restored",
  description: "Restored: clear",
  usage: ".clear",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
