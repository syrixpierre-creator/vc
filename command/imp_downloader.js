/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for _downloader.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "_downloader.js",
  family: "B",
  command: "downloader",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloader",
  aliases: [],
  category: "restored",
  description: "Restored: _downloader",
  usage: ".downloader",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
