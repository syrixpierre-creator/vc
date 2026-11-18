/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for games-tictactoe.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "games-tictactoe.js",
  family: "B",
  command: "xgamestictactoe",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgamestictactoe",
  aliases: [],
  category: "restored",
  description: "Restored: games-tictactoe",
  usage: ".xgamestictactoe",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
