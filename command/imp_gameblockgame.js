/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-blockgame.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-blockgame.js",
  family: "B",
  command: "gameblockgame",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameblockgame",
  aliases: [],
  category: "restored",
  description: "Restored: game-blockgame",
  usage: ".gameblockgame",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
