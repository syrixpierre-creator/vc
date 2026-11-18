/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-instatiktok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-instatiktok.js",
  family: "A",
  command: "downloaderinstatiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderinstatiktok",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-instatiktok",
  usage: ".downloaderinstatiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
