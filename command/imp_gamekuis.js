/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-kuis.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-kuis.js",
  family: "B",
  command: "gamekuis",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamekuis",
  aliases: [],
  category: "restored",
  description: "Restored: game-kuis",
  usage: ".gamekuis",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
