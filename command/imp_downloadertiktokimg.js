/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-tiktok_img.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-tiktok_img.js",
  family: "B",
  command: "downloadertiktokimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadertiktokimg",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-tiktok_img",
  usage: ".downloadertiktokimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
