/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for spam.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "spam.js",
  family: "B",
  command: "spam",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "spam",
  aliases: [],
  category: "restored",
  description: "Restored: spam",
  usage: ".spam",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
