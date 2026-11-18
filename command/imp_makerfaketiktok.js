/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-faketiktok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-faketiktok.js",
  family: "A",
  command: "makerfaketiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerfaketiktok",
  aliases: [],
  category: "restored",
  description: "Restored: maker-faketiktok",
  usage: ".makerfaketiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
