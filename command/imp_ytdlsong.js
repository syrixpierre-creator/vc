/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ytdl-song.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ytdl-song.js",
  family: "B",
  command: "ytdlsong",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ytdlsong",
  aliases: [],
  category: "restored",
  description: "Restored: ytdl-song",
  usage: ".ytdlsong",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
