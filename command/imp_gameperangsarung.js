/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-perangsarung.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-perangsarung.js",
  family: "B",
  command: "gameperangsarung",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameperangsarung",
  aliases: [],
  category: "restored",
  description: "Restored: game-perangsarung",
  usage: ".gameperangsarung",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
