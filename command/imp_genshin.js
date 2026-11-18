/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for genshin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "genshin.js",
  family: "A",
  command: "genshin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "genshin",
  aliases: [],
  category: "restored",
  description: "Restored: genshin",
  usage: ".genshin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
