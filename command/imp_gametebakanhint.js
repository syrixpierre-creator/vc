/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebakan-hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebakan-hint.js",
  family: "A",
  command: "gametebakanhint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebakanhint",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebakan-hint",
  usage: ".gametebakanhint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
