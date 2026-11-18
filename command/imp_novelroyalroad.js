/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for novel-royalroad.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "novel-royalroad.js",
  family: "A",
  command: "novelroyalroad",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "novelroyalroad",
  aliases: [],
  category: "restored",
  description: "Restored: novel-royalroad",
  usage: ".novelroyalroad",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
