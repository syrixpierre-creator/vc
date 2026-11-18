/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakaml_hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakaml_hint.js",
  family: "A",
  command: "gametebakamlhint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakamlhint",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakaml_hint",
  usage: ".gametebakamlhint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
