/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-togel.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-togel.js",
  family: "B",
  command: "gametogel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametogel",
  aliases: [],
  category: "restored",
  description: "Restored: game-togel",
  usage: ".gametogel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
