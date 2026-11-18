/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-nyerah.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-nyerah.js",
  family: "B",
  command: "gamenyerah",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamenyerah",
  aliases: [],
  category: "restored",
  description: "Restored: game-nyerah",
  usage: ".gamenyerah",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
