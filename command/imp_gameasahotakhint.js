/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-asahotak-hint.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-asahotak-hint.js",
  family: "A",
  command: "gameasahotakhint",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameasahotakhint",
  aliases: [],
  category: "restored",
  description: "Restored: game-asahotak-hint",
  usage: ".gameasahotakhint",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
