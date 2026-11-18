/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakgambar.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakgambar.js",
  family: "B",
  command: "gametebakgambar",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakgambar",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakgambar",
  usage: ".gametebakgambar",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
