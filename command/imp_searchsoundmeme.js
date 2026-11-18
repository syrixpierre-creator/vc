/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-soundmeme.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-soundmeme.js",
  family: "B",
  command: "searchsoundmeme",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchsoundmeme",
  aliases: [],
  category: "restored",
  description: "Restored: search-soundmeme",
  usage: ".searchsoundmeme",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
