/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nsfw-hentai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nsfw-hentai.js",
  family: "B",
  command: "nsfwhentai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nsfwhentai",
  aliases: [],
  category: "restored",
  description: "Restored: nsfw-hentai",
  usage: ".nsfwhentai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
