/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-videy2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-videy2.js",
  family: "B",
  command: "downloadervidey2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadervidey2",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-videy2",
  usage: ".downloadervidey2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
