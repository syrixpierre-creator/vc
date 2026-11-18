/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-uno.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-uno.js",
  family: "B",
  command: "gameuno",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameuno",
  aliases: [],
  category: "restored",
  description: "Restored: game-uno",
  usage: ".gameuno",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
