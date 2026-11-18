/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-hangman.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-hangman.js",
  family: "B",
  command: "gamehangman",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamehangman",
  aliases: [],
  category: "restored",
  description: "Restored: game-hangman",
  usage: ".gamehangman",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
