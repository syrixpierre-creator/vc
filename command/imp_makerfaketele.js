/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-faketele.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-faketele.js",
  family: "B",
  command: "makerfaketele",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfaketele",
  aliases: [],
  category: "restored",
  description: "Restored: maker-faketele",
  usage: ".makerfaketele",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
