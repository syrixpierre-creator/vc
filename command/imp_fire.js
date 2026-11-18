/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fire.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fire.js",
  family: "B",
  command: "fire",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "fire",
  aliases: [],
  category: "restored",
  description: "Restored: fire",
  usage: ".fire",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
