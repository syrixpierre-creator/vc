/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakediscoard.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakediscoard.js",
  family: "B",
  command: "makerfakediscoard",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakediscoard",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakediscoard",
  usage: ".makerfakediscoard",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
