/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for spotifyplay.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "spotifyplay.js",
  family: "B",
  command: "spotifyplay",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "spotifyplay",
  aliases: [],
  category: "restored",
  description: "Restored: spotifyplay",
  usage: ".spotifyplay",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
