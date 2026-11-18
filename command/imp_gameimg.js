/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gameImg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gameImg.js",
  family: "A",
  command: "gameimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gameimg",
  aliases: [],
  category: "restored",
  description: "Restored: gameImg",
  usage: ".gameimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
