/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-atm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-atm.js",
  family: "B",
  command: "rpgatm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgatm",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-atm",
  usage: ".rpgatm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
