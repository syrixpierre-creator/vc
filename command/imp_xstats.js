/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for stats.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "stats.js",
  family: "A",
  command: "xstats",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xstats",
  aliases: [],
  category: "restored",
  description: "Restored: stats",
  usage: ".xstats",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
