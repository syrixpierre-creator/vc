/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-sfile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-sfile.js",
  family: "B",
  command: "downloadersfile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadersfile",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-sfile",
  usage: ".downloadersfile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
