/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-berburu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-berburu.js",
  family: "B",
  command: "rpgberburu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgberburu",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-berburu",
  usage: ".rpgberburu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
