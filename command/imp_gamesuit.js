/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-suit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-suit.js",
  family: "B",
  command: "gamesuit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamesuit",
  aliases: [],
  category: "restored",
  description: "Restored: game-suit",
  usage: ".gamesuit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
