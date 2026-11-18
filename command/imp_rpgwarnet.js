/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-warnet.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-warnet.js",
  family: "B",
  command: "rpgwarnet",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgwarnet",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-warnet",
  usage: ".rpgwarnet",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
