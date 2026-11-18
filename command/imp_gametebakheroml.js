/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakheroml.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakheroml.js",
  family: "B",
  command: "gametebakheroml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakheroml",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakheroml",
  usage: ".gametebakheroml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
