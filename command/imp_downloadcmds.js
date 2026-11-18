/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for download-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "download-cmds.js",
  family: "B",
  command: "downloadcmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downloadcmds",
  aliases: [],
  category: "restored",
  description: "Restored: download-cmds",
  usage: ".downloadcmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
