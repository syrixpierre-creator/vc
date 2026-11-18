/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-inventory.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-inventory.js",
  family: "B",
  command: "rpginventory",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpginventory",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-inventory",
  usage: ".rpginventory",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
