/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools.js",
  family: "B",
  command: "tools",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tools",
  aliases: [],
  category: "restored",
  description: "Restored: tools",
  usage: ".tools",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
