/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for teddy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "teddy.js",
  family: "A",
  command: "teddy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "teddy",
  aliases: [],
  category: "restored",
  description: "Restored: teddy",
  usage: ".teddy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
