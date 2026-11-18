/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-ceklevel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-ceklevel.js",
  family: "B",
  command: "rpgceklevel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgceklevel",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-ceklevel",
  usage: ".rpgceklevel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
