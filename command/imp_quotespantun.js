/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-pantun.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-pantun.js",
  family: "A",
  command: "quotespantun",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotespantun",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-pantun",
  usage: ".quotespantun",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
