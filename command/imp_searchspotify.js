/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for search-spotify.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "search-spotify.js",
  family: "B",
  command: "searchspotify",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "searchspotify",
  aliases: [],
  category: "restored",
  description: "Restored: search-spotify",
  usage: ".searchspotify",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
