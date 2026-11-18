/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-siapakahaku_hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-siapakahaku_hint.js",
  family: "A",
  command: "gamesiapakahakuhint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamesiapakahakuhint",
  aliases: [],
  category: "restored",
  description: "Restored: game-siapakahaku_hint",
  usage: ".gamesiapakahakuhint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
