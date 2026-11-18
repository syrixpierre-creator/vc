/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-bank.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-bank.js",
  family: "B",
  command: "rpgbank",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgbank",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-bank",
  usage: ".rpgbank",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
