/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-kandang.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-kandang.js",
  family: "B",
  command: "rpgkandang",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgkandang",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-kandang",
  usage: ".rpgkandang",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
