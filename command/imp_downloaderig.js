/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-ig.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-ig.js",
  family: "B",
  command: "downloaderig",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderig",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-ig",
  usage: ".downloaderig",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
