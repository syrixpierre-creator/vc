/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-caklontong.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-caklontong.js",
  family: "B",
  command: "gamecaklontong",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamecaklontong",
  aliases: [],
  category: "restored",
  description: "Restored: game-caklontong",
  usage: ".gamecaklontong",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
