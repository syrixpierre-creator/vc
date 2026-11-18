/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakbenda.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakbenda.js",
  family: "B",
  command: "gametebakbenda",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakbenda",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakbenda",
  usage: ".gametebakbenda",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
