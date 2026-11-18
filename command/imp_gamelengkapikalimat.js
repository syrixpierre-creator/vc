/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-lengkapikalimat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-lengkapikalimat.js",
  family: "B",
  command: "gamelengkapikalimat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamelengkapikalimat",
  aliases: [],
  category: "restored",
  description: "Restored: game-lengkapikalimat",
  usage: ".gamelengkapikalimat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
