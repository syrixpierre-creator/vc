/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for anime-imagesearch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "anime-imagesearch.js",
  family: "A",
  command: "animeimagesearch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "animeimagesearch",
  aliases: [],
  category: "restored",
  description: "Restored: anime-imagesearch",
  usage: ".animeimagesearch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
