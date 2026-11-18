/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-genshinprofile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-genshinprofile.js",
  family: "B",
  command: "gamegenshinprofile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gamegenshinprofile",
  aliases: [],
  category: "restored",
  description: "Restored: game-genshinprofile",
  usage: ".gamegenshinprofile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
