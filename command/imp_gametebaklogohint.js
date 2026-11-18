/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebaklogo_hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebaklogo_hint.js",
  family: "A",
  command: "gametebaklogohint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebaklogohint",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebaklogo_hint",
  usage: ".gametebaklogohint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
