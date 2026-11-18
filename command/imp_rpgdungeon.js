/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-dungeon.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-dungeon.js",
  family: "B",
  command: "rpgdungeon",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgdungeon",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-dungeon",
  usage: ".rpgdungeon",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
