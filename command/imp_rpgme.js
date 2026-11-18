/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-me.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-me.js",
  family: "B",
  command: "rpgme",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgme",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-me",
  usage: ".rpgme",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
