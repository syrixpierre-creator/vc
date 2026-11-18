/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-rank.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-rank.js",
  family: "B",
  command: "rpgrank",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgrank",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-rank",
  usage: ".rpgrank",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
