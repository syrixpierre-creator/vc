/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bypass.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bypass.js",
  family: "B",
  command: "xbypass",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xbypass",
  aliases: [],
  category: "restored",
  description: "Restored: bypass",
  usage: ".xbypass",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
