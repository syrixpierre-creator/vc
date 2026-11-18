/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-status.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-status.js",
  family: "B",
  command: "rpgstatus",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgstatus",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-status",
  usage: ".rpgstatus",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
