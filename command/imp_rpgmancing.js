/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-mancing.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-mancing.js",
  family: "B",
  command: "rpgmancing",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgmancing",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-mancing",
  usage: ".rpgmancing",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
