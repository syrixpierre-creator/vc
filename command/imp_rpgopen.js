/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-open.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-open.js",
  family: "B",
  command: "rpgopen",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgopen",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-open",
  usage: ".rpgopen",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
