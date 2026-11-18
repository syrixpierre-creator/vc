/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-idgc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-idgc.js",
  family: "A",
  command: "toolsidgc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsidgc",
  aliases: [],
  category: "restored",
  description: "Restored: tools-idgc",
  usage: ".toolsidgc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
