/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader.js",
  family: "B",
  command: "xdownloader",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xdownloader",
  aliases: [],
  category: "restored",
  description: "Restored: downloader",
  usage: ".xdownloader",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
