/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-buy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-buy.js",
  family: "B",
  command: "rpgbuy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgbuy",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-buy",
  usage: ".rpgbuy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
