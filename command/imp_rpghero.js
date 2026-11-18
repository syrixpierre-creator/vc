/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-hero.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-hero.js",
  family: "B",
  command: "rpghero",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpghero",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-hero",
  usage: ".rpghero",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
