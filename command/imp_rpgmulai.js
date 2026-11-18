/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-mulai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-mulai.js",
  family: "B",
  command: "rpgmulai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgmulai",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-mulai",
  usage: ".rpgmulai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
