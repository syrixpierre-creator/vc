/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-casino.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-casino.js",
  family: "B",
  command: "rpgcasino",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgcasino",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-casino",
  usage: ".rpgcasino",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
