/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakmakanan-hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakmakanan-hint.js",
  family: "A",
  command: "gametebakmakananhint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakmakananhint",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakmakanan-hint",
  usage: ".gametebakmakananhint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
