/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-warteg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-warteg.js",
  family: "B",
  command: "rpgwarteg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgwarteg",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-warteg",
  usage: ".rpgwarteg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
