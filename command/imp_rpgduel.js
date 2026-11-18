/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-duel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-duel.js",
  family: "B",
  command: "rpgduel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgduel",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-duel",
  usage: ".rpgduel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
