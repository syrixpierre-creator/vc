/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakkimia.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakkimia.js",
  family: "B",
  command: "gametebakkimia",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakkimia",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakkimia",
  usage: ".gametebakkimia",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
