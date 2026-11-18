/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebaklirik_hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebaklirik_hint.js",
  family: "A",
  command: "gametebaklirikhint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebaklirikhint",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebaklirik_hint",
  usage: ".gametebaklirikhint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
