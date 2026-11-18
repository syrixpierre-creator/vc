/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-readviewonce.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-readviewonce.js",
  family: "A",
  command: "toolsreadviewonce",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsreadviewonce",
  aliases: [],
  category: "restored",
  description: "Restored: tools-readviewonce",
  usage: ".toolsreadviewonce",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
