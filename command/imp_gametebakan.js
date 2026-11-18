/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakan.js",
  family: "B",
  command: "gametebakan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakan",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakan",
  usage: ".gametebakan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
