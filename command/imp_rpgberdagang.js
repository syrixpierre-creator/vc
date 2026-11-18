/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-berdagang.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-berdagang.js",
  family: "B",
  command: "rpgberdagang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgberdagang",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-berdagang",
  usage: ".rpgberdagang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
