/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-getpp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-getpp.js",
  family: "B",
  command: "toolsgetpp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsgetpp",
  aliases: [],
  category: "restored",
  description: "Restored: tools-getpp",
  usage: ".toolsgetpp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
