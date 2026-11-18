/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for news.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "news.js",
  family: "A",
  command: "news",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "news",
  aliases: [],
  category: "restored",
  description: "Restored: news",
  usage: ".news",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
