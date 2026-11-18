/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-toimg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-toimg.js",
  family: "B",
  command: "toolstoimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolstoimg",
  aliases: [],
  category: "restored",
  description: "Restored: tools-toimg",
  usage: ".toolstoimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
