/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-bansos.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-bansos.js",
  family: "B",
  command: "rpgbansos",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgbansos",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-bansos",
  usage: ".rpgbansos",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
