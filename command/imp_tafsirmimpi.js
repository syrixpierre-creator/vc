/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tafsirmimpi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tafsirmimpi.js",
  family: "A",
  command: "tafsirmimpi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tafsirmimpi",
  aliases: [],
  category: "restored",
  description: "Restored: tafsirmimpi",
  usage: ".tafsirmimpi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
