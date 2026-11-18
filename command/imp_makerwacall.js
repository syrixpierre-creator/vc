/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-wacall.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-wacall.js",
  family: "B",
  command: "makerwacall",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerwacall",
  aliases: [],
  category: "restored",
  description: "Restored: maker-wacall",
  usage: ".makerwacall",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
