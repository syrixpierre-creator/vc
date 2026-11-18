/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for 1917.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "1917.js",
  family: "B",
  command: "1917",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "1917",
  aliases: [],
  category: "restored",
  description: "Restored: 1917",
  usage: ".1917",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
