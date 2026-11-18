/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-berkebon.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-berkebon.js",
  family: "B",
  command: "rpgberkebon",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgberkebon",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-berkebon",
  usage: ".rpgberkebon",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
