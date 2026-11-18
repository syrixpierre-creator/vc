/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-berita.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-berita.js",
  family: "A",
  command: "makerberita",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerberita",
  aliases: [],
  category: "restored",
  description: "Restored: maker-berita",
  usage: ".makerberita",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
