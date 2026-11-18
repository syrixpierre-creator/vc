/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-anime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-anime.js",
  family: "A",
  command: "xquotesanime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xquotesanime",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-anime",
  usage: ".xquotesanime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
