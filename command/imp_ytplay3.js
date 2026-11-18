/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for yt-play3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "yt-play3.js",
  family: "B",
  command: "ytplay3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ytplay3",
  aliases: [],
  category: "restored",
  description: "Restored: yt-play3",
  usage: ".ytplay3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
