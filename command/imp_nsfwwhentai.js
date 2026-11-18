/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-whentai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-whentai.js",
  family: "B",
  command: "nsfwwhentai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwwhentai",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-whentai",
  usage: ".nsfwwhentai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
