/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-suitpvp-ans.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-suitpvp-ans.js",
  family: "B",
  command: "gamesuitpvpans",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamesuitpvpans",
  aliases: [],
  category: "restored",
  description: "Restored: game-suitpvp-ans",
  usage: ".gamesuitpvpans",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
