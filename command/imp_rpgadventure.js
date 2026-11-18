/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-adventure.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-adventure.js",
  family: "B",
  command: "rpgadventure",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgadventure",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-adventure",
  usage: ".rpgadventure",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
