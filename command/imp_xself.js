/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for self.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "self.js",
  family: "B",
  command: "xself",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xself",
  aliases: [],
  category: "restored",
  description: "Restored: self",
  usage: ".xself",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
