/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakgambar-hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakgambar-hint.js",
  family: "A",
  command: "gametebakgambarhint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakgambarhint",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakgambar-hint",
  usage: ".gametebakgambarhint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
