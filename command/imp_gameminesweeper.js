/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-minesweeper.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-minesweeper.js",
  family: "B",
  command: "gameminesweeper",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameminesweeper",
  aliases: [],
  category: "restored",
  description: "Restored: game-minesweeper",
  usage: ".gameminesweeper",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
