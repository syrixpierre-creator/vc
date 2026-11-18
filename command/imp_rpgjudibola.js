/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-judibola.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-judibola.js",
  family: "B",
  command: "rpgjudibola",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgjudibola",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-judibola",
  usage: ".rpgjudibola",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
