/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-otakudesusearch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-otakudesusearch.js",
  family: "B",
  command: "animeotakudesusearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animeotakudesusearch",
  aliases: [],
  category: "restored",
  description: "Restored: anime-otakudesusearch",
  usage: ".animeotakudesusearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
