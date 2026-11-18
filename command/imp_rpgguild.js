/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-guild.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-guild.js",
  family: "B",
  command: "rpgguild",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgguild",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-guild",
  usage: ".rpgguild",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
