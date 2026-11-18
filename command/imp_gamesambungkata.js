/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-sambungkata.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-sambungkata.js",
  family: "B",
  command: "gamesambungkata",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamesambungkata",
  aliases: [],
  category: "restored",
  description: "Restored: game-sambungkata",
  usage: ".gamesambungkata",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
