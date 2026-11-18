/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-family100-hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-family100-hint.js",
  family: "B",
  command: "gamefamily100hint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamefamily100hint",
  aliases: [],
  category: "restored",
  description: "Restored: game-family100-hint",
  usage: ".gamefamily100hint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
