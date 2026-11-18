/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-compress.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-compress.js",
  family: "B",
  command: "toolscompress",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolscompress",
  aliases: [],
  category: "restored",
  description: "Restored: tools-compress",
  usage: ".toolscompress",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
