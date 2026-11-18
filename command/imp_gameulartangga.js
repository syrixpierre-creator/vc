/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-ulartangga.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-ulartangga.js",
  family: "B",
  command: "gameulartangga",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameulartangga",
  aliases: [],
  category: "restored",
  description: "Restored: game-ulartangga",
  usage: ".gameulartangga",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
