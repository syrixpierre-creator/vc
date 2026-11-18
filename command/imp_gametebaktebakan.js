/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebaktebakan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebaktebakan.js",
  family: "B",
  command: "gametebaktebakan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebaktebakan",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebaktebakan",
  usage: ".gametebaktebakan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
