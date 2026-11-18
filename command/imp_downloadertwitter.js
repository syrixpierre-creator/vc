/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-twitter.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-twitter.js",
  family: "B",
  command: "downloadertwitter",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadertwitter",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-twitter",
  usage: ".downloadertwitter",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
