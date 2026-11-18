/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rpg-leaderboard.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rpg-leaderboard.js",
  family: "B",
  command: "rpgleaderboard",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "rpgleaderboard",
  aliases: [],
  category: "restored",
  description: "Restored: rpg-leaderboard",
  usage: ".rpgleaderboard",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
