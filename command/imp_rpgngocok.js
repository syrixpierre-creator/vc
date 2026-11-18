/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-ngocok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-ngocok.js",
  family: "B",
  command: "rpgngocok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgngocok",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-ngocok",
  usage: ".rpgngocok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
