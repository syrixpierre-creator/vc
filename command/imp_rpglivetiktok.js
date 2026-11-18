/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-livetiktok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-livetiktok.js",
  family: "B",
  command: "rpglivetiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpglivetiktok",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-livetiktok",
  usage: ".rpglivetiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
