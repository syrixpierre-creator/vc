/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebaksurah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebaksurah.js",
  family: "B",
  command: "gametebaksurah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebaksurah",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebaksurah",
  usage: ".gametebaksurah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
