/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakgame.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakgame.js",
  family: "B",
  command: "gametebakgame",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakgame",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakgame",
  usage: ".gametebakgame",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
