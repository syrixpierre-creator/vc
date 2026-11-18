/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-tiktok3.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-tiktok3.js",
  family: "A",
  command: "downloadertiktok3",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadertiktok3",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-tiktok3",
  usage: ".downloadertiktok3",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
