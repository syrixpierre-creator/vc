/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-leaderboard.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-leaderboard.js",
  family: "B",
  command: "gameleaderboard",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameleaderboard",
  aliases: [],
  category: "restored",
  description: "Restored: game-leaderboard",
  usage: ".gameleaderboard",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
