/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebaklogo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebaklogo.js",
  family: "B",
  command: "gametebaklogo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebaklogo",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebaklogo",
  usage: ".gametebaklogo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
