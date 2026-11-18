/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-fanart.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-fanart.js",
  family: "B",
  command: "animefanart",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animefanart",
  aliases: [],
  category: "restored",
  description: "Restored: anime-fanart",
  usage: ".animefanart",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
