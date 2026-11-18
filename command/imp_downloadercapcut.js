/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-capcut.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-capcut.js",
  family: "A",
  command: "downloadercapcut",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadercapcut",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-capcut",
  usage: ".downloadercapcut",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
