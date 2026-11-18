/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-dadu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-dadu.js",
  family: "B",
  command: "gamedadu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamedadu",
  aliases: [],
  category: "restored",
  description: "Restored: game-dadu",
  usage: ".gamedadu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
