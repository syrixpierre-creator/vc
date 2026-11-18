/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebaklagu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebaklagu.js",
  family: "B",
  command: "gametebaklagu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebaklagu",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebaklagu",
  usage: ".gametebaklagu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
