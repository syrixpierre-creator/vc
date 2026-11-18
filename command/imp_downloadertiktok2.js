/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-tiktok2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-tiktok2.js",
  family: "B",
  command: "downloadertiktok2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadertiktok2",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-tiktok2",
  usage: ".downloadertiktok2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
