/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for vars.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "vars.js",
  family: "B",
  command: "vars",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "vars",
  aliases: [],
  category: "restored",
  description: "Restored: vars",
  usage: ".vars",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
