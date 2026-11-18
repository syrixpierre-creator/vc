/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-cerdascermat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-cerdascermat.js",
  family: "B",
  command: "gamecerdascermat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamecerdascermat",
  aliases: [],
  category: "restored",
  description: "Restored: game-cerdascermat",
  usage: ".gamecerdascermat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
