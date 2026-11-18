/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-slot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-slot.js",
  family: "B",
  command: "gameslot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameslot",
  aliases: [],
  category: "restored",
  description: "Restored: game-slot",
  usage: ".gameslot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
