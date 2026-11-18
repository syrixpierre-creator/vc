/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for afk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "afk.js",
  family: "A",
  command: "xafk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xafk",
  aliases: [],
  category: "restored",
  description: "Restored: afk",
  usage: ".xafk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
