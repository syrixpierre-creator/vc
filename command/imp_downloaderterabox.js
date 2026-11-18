/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-terabox.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-terabox.js",
  family: "B",
  command: "downloaderterabox",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderterabox",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-terabox",
  usage: ".downloaderterabox",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
