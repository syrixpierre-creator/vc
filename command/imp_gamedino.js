/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-dino.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-dino.js",
  family: "B",
  command: "gamedino",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamedino",
  aliases: [],
  category: "restored",
  description: "Restored: game-dino",
  usage: ".gamedino",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
