/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-otakudesu.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-otakudesu.js",
  family: "B",
  command: "animeotakudesu",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animeotakudesu",
  aliases: [],
  category: "restored",
  description: "Restored: anime-otakudesu",
  usage: ".animeotakudesu",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
