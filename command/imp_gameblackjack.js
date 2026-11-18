/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-blackjack.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-blackjack.js",
  family: "B",
  command: "gameblackjack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameblackjack",
  aliases: [],
  category: "restored",
  description: "Restored: game-blackjack",
  usage: ".gameblackjack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
