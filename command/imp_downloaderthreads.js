/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-threads.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-threads.js",
  family: "A",
  command: "downloaderthreads",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderthreads",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-threads",
  usage: ".downloaderthreads",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
