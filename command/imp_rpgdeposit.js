/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-deposit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-deposit.js",
  family: "B",
  command: "rpgdeposit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgdeposit",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-deposit",
  usage: ".rpgdeposit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
