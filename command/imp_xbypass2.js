/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bypass2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bypass2.js",
  family: "B",
  command: "xbypass2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xbypass2",
  aliases: [],
  category: "restored",
  description: "Restored: bypass2",
  usage: ".xbypass2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
