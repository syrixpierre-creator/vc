/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-tofile.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-tofile.js",
  family: "A",
  command: "toolstofile",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolstofile",
  aliases: [],
  category: "restored",
  description: "Restored: tools-tofile",
  usage: ".toolstofile",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
