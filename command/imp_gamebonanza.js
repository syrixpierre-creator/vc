/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-bonanza.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-bonanza.js",
  family: "B",
  command: "gamebonanza",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamebonanza",
  aliases: [],
  category: "restored",
  description: "Restored: game-bonanza",
  usage: ".gamebonanza",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
