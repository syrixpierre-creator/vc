/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ytdl-play.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ytdl-play.js",
  family: "B",
  command: "ytdlplay",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ytdlplay",
  aliases: [],
  category: "restored",
  description: "Restored: ytdl-play",
  usage: ".ytdlplay",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
