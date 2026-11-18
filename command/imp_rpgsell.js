/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-sell.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-sell.js",
  family: "B",
  command: "rpgsell",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgsell",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-sell",
  usage: ".rpgsell",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
