/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-suitpvp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-suitpvp.js",
  family: "B",
  command: "gamesuitpvp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamesuitpvp",
  aliases: [],
  category: "restored",
  description: "Restored: game-suitpvp",
  usage: ".gamesuitpvp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
