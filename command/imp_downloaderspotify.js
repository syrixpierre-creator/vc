/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-spotify.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-spotify.js",
  family: "B",
  command: "downloaderspotify",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderspotify",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-spotify",
  usage: ".downloaderspotify",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
