/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakanml.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakanml.js",
  family: "B",
  command: "gametebakanml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakanml",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakanml",
  usage: ".gametebakanml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
