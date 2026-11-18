/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-geometry.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-geometry.js",
  family: "B",
  command: "gamegeometry",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamegeometry",
  aliases: [],
  category: "restored",
  description: "Restored: game-geometry",
  usage: ".gamegeometry",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
