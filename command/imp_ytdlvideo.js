/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ytdl-video.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ytdl-video.js",
  family: "B",
  command: "ytdlvideo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ytdlvideo",
  aliases: [],
  category: "restored",
  description: "Restored: ytdl-video",
  usage: ".ytdlvideo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
