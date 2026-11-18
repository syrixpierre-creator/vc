/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for greet.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "greet.js",
  family: "B",
  command: "xgreet",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgreet",
  aliases: [],
  category: "restored",
  description: "Restored: greet",
  usage: ".xgreet",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
