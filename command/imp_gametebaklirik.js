/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebaklirik.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebaklirik.js",
  family: "B",
  command: "gametebaklirik",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebaklirik",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebaklirik",
  usage: ".gametebaklirik",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
