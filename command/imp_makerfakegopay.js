/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakegopay.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakegopay.js",
  family: "B",
  command: "makerfakegopay",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakegopay",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakegopay",
  usage: ".makerfakegopay",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
