/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-heal.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-heal.js",
  family: "B",
  command: "rpgheal",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgheal",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-heal",
  usage: ".rpgheal",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
