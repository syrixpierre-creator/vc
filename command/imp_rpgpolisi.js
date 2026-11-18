/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-polisi.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-polisi.js",
  family: "B",
  command: "rpgpolisi",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgpolisi",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-polisi",
  usage: ".rpgpolisi",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
