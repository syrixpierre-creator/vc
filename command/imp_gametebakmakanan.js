/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakmakanan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakmakanan.js",
  family: "B",
  command: "gametebakmakanan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakmakanan",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakmakanan",
  usage: ".gametebakmakanan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
