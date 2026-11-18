/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-family100.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-family100.js",
  family: "B",
  command: "gamefamily100",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamefamily100",
  aliases: [],
  category: "restored",
  description: "Restored: game-family100",
  usage: ".gamefamily100",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
