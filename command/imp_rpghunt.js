/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-hunt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-hunt.js",
  family: "B",
  command: "rpghunt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpghunt",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-hunt",
  usage: ".rpghunt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
