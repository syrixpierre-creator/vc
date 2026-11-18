/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-siapakahaku.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-siapakahaku.js",
  family: "B",
  command: "gamesiapakahaku",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamesiapakahaku",
  aliases: [],
  category: "restored",
  description: "Restored: game-siapakahaku",
  usage: ".gamesiapakahaku",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
