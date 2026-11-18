/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tekateki.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tekateki.js",
  family: "B",
  command: "gametekateki",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametekateki",
  aliases: [],
  category: "restored",
  description: "Restored: game-tekateki",
  usage: ".gametekateki",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
