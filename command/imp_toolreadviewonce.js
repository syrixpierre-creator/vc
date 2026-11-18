/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-readviewonce.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-readviewonce.js",
  family: "B",
  command: "toolreadviewonce",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolreadviewonce",
  aliases: [],
  category: "restored",
  description: "Restored: tool-readviewonce",
  usage: ".toolreadviewonce",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
