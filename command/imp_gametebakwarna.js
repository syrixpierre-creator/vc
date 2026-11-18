/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakwarna.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakwarna.js",
  family: "B",
  command: "gametebakwarna",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakwarna",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakwarna",
  usage: ".gametebakwarna",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
