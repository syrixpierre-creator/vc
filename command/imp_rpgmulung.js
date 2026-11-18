/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-mulung.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-mulung.js",
  family: "B",
  command: "rpgmulung",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgmulung",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-mulung",
  usage: ".rpgmulung",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
