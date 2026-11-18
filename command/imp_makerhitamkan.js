/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-hitamkan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-hitamkan.js",
  family: "A",
  command: "makerhitamkan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerhitamkan",
  aliases: [],
  category: "restored",
  description: "Restored: maker-hitamkan",
  usage: ".makerhitamkan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
