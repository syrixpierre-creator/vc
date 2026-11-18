/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-kerja.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-kerja.js",
  family: "B",
  command: "rpgkerja",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgkerja",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-kerja",
  usage: ".rpgkerja",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
