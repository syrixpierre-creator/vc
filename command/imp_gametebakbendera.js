/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakbendera.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakbendera.js",
  family: "B",
  command: "gametebakbendera",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakbendera",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakbendera",
  usage: ".gametebakbendera",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
