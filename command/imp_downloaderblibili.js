/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-blibili.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-blibili.js",
  family: "B",
  command: "downloaderblibili",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderblibili",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-blibili",
  usage: ".downloaderblibili",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
