/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakgame_hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakgame_hint.js",
  family: "A",
  command: "gametebakgamehint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakgamehint",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakgame_hint",
  usage: ".gametebakgamehint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
