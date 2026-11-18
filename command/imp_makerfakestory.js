/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakestory.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakestory.js",
  family: "B",
  command: "makerfakestory",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakestory",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakestory",
  usage: ".makerfakestory",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
