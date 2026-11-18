/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakjkt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakjkt.js",
  family: "B",
  command: "gametebakjkt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakjkt",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakjkt",
  usage: ".gametebakjkt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
