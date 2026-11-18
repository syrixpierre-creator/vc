/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-tebaktebakan_hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-tebaktebakan_hint.js",
  family: "B",
  command: "gametebaktebakanhint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gametebaktebakanhint",
  aliases: [],
  category: "restored",
  description: "Restored: game-tebaktebakan_hint",
  usage: ".gametebaktebakanhint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
