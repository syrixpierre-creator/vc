/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-bom-ans.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-bom-ans.js",
  family: "B",
  command: "gamebomans",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamebomans",
  aliases: [],
  category: "restored",
  description: "Restored: game-bom-ans",
  usage: ".gamebomans",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
