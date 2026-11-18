/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader2.js",
  family: "B",
  command: "downloader2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloader2",
  aliases: [],
  category: "restored",
  description: "Restored: downloader2",
  usage: ".downloader2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
