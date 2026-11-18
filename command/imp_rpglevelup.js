/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-levelup.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-levelup.js",
  family: "B",
  command: "rpglevelup",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpglevelup",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-levelup",
  usage: ".rpglevelup",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
