/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-mediafire.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-mediafire.js",
  family: "B",
  command: "downloadermediafire",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadermediafire",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-mediafire",
  usage: ".downloadermediafire",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
