/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-caklontong_hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-caklontong_hint.js",
  family: "A",
  command: "gamecaklontonghint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamecaklontonghint",
  aliases: [],
  category: "restored",
  description: "Restored: game-caklontong_hint",
  usage: ".gamecaklontonghint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
