/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pokedex.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pokedex.js",
  family: "A",
  command: "pokedex",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pokedex",
  aliases: [],
  category: "restored",
  description: "Restored: pokedex",
  usage: ".pokedex",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
