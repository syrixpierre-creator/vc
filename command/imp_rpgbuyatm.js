/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-buyatm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-buyatm.js",
  family: "B",
  command: "rpgbuyatm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgbuyatm",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-buyatm",
  usage: ".rpgbuyatm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
