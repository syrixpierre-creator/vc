/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-fakewafat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-fakewafat.js",
  family: "B",
  command: "makerfakewafat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfakewafat",
  aliases: [],
  category: "restored",
  description: "Restored: maker-fakewafat",
  usage: ".makerfakewafat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
