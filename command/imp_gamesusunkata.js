/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-susunkata.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-susunkata.js",
  family: "B",
  command: "gamesusunkata",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamesusunkata",
  aliases: [],
  category: "restored",
  description: "Restored: game-susunkata",
  usage: ".gamesusunkata",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
