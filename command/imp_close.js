/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for close.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "close.js",
  family: "B",
  command: "close",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "close",
  aliases: [],
  category: "restored",
  description: "Restored: close",
  usage: ".close",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
