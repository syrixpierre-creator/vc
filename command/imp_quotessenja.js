/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-senja.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-senja.js",
  family: "A",
  command: "quotessenja",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotessenja",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-senja",
  usage: ".quotessenja",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
