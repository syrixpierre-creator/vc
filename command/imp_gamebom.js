/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-bom.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-bom.js",
  family: "B",
  command: "gamebom",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamebom",
  aliases: [],
  category: "restored",
  description: "Restored: game-bom",
  usage: ".gamebom",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
