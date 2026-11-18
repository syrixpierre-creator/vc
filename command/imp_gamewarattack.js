/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-war-attack.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-war-attack.js",
  family: "B",
  command: "gamewarattack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamewarattack",
  aliases: [],
  category: "restored",
  description: "Restored: game-war-attack",
  usage: ".gamewarattack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
