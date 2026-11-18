/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-truthordare.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-truthordare.js",
  family: "B",
  command: "gametruthordare",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametruthordare",
  aliases: [],
  category: "restored",
  description: "Restored: game-truthordare",
  usage: ".gametruthordare",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
