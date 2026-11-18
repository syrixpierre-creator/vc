/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-cooldown.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-cooldown.js",
  family: "B",
  command: "rpgcooldown",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgcooldown",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-cooldown",
  usage: ".rpgcooldown",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
