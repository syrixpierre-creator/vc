/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-pinvideo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-pinvideo.js",
  family: "B",
  command: "searchpinvideo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchpinvideo",
  aliases: [],
  category: "restored",
  description: "Restored: search-pinvideo",
  usage: ".searchpinvideo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
