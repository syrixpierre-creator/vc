/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-enc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-enc.js",
  family: "B",
  command: "toolsenc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsenc",
  aliases: [],
  category: "restored",
  description: "Restored: tools-enc",
  usage: ".toolsenc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
