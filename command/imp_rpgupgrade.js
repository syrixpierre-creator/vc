/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-upgrade.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-upgrade.js",
  family: "B",
  command: "rpgupgrade",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgupgrade",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-upgrade",
  usage: ".rpgupgrade",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
