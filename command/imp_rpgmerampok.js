/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-merampok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-merampok.js",
  family: "B",
  command: "rpgmerampok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgmerampok",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-merampok",
  usage: ".rpgmerampok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
