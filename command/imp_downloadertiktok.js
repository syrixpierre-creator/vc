/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-tiktok.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-tiktok.js",
  family: "B",
  command: "downloadertiktok",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadertiktok",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-tiktok",
  usage: ".downloadertiktok",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
