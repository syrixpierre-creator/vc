/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-war.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-war.js",
  family: "B",
  command: "gamewar",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamewar",
  aliases: [],
  category: "restored",
  description: "Restored: game-war",
  usage: ".gamewar",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
