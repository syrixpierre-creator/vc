/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-buah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-buah.js",
  family: "B",
  command: "rpgbuah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgbuah",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-buah",
  usage: ".rpgbuah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
