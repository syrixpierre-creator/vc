/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools2.js",
  family: "B",
  command: "tools2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tools2",
  aliases: [],
  category: "restored",
  description: "Restored: tools2",
  usage: ".tools2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
