/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-craft.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-craft.js",
  family: "B",
  command: "rpgcraft",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgcraft",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-craft",
  usage: ".rpgcraft",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
