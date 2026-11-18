/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for downloader-igaudio.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "downloader-igaudio.js",
  family: "A",
  command: "downloaderigaudio",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloaderigaudio",
  aliases: [],
  category: "restored",
  description: "Restored: downloader-igaudio",
  usage: ".downloaderigaudio",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
