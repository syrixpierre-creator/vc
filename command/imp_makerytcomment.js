/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-ytcomment.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-ytcomment.js",
  family: "A",
  command: "makerytcomment",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerytcomment",
  aliases: [],
  category: "restored",
  description: "Restored: maker-ytcomment",
  usage: ".makerytcomment",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
