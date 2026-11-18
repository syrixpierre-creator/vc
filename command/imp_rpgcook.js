/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-cook.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-cook.js",
  family: "B",
  command: "rpgcook",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgcook",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-cook",
  usage: ".rpgcook",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
