/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-chess.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-chess.js",
  family: "B",
  command: "gamechess",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamechess",
  aliases: [],
  category: "restored",
  description: "Restored: game-chess",
  usage: ".gamechess",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
