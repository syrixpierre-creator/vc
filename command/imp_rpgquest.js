/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-quest.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-quest.js",
  family: "B",
  command: "rpgquest",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgquest",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-quest",
  usage: ".rpgquest",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
