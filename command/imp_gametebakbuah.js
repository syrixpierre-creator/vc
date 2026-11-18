/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakbuah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakbuah.js",
  family: "B",
  command: "gametebakbuah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakbuah",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakbuah",
  usage: ".gametebakbuah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
