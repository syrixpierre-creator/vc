/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for block.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "block.js",
  family: "B",
  command: 'blockalt',
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "block",
  aliases: [],
  category: "restored",
  description: "Restored: block",
  usage: ".block",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
