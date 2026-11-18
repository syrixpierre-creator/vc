/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakedana.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakedana.js",
  family: "B",
  command: "makerfakedana",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakedana",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakedana",
  usage: ".makerfakedana",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
