/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-setrpg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-setrpg.js",
  family: "B",
  command: "rpgsetrpg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgsetrpg",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-setrpg",
  usage: ".rpgsetrpg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
