/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-bet.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-bet.js",
  family: "B",
  command: "rpgbet",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgbet",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-bet",
  usage: ".rpgbet",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
