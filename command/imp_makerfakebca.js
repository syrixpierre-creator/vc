/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakebca.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakebca.js",
  family: "B",
  command: "makerfakebca",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakebca",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakebca",
  usage: ".makerfakebca",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
