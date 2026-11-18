/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-hdvid.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-hdvid.js",
  family: "B",
  command: "toolshdvid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolshdvid",
  aliases: [],
  category: "restored",
  description: "Restored: tools-hdvid",
  usage: ".toolshdvid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
