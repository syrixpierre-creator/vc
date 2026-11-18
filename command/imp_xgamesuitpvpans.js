/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for game-suitpvp_ans.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "game-suitpvp_ans.js",
  family: "B",
  command: "xgamesuitpvpans",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgamesuitpvpans",
  aliases: [],
  category: "restored",
  description: "Restored: game-suitpvp_ans",
  usage: ".xgamesuitpvpans",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
