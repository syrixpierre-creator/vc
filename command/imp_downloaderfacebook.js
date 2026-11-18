/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-facebook.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-facebook.js",
  family: "B",
  command: "downloaderfacebook",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderfacebook",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-facebook",
  usage: ".downloaderfacebook",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
