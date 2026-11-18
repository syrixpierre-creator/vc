/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-videy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-videy.js",
  family: "B",
  command: "downloadervidey",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadervidey",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-videy",
  usage: ".downloadervidey",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
