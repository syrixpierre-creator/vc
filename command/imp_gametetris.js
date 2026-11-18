/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tetris.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tetris.js",
  family: "B",
  command: "gametetris",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametetris",
  aliases: [],
  category: "restored",
  description: "Restored: game-tetris",
  usage: ".gametetris",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
