/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-resize.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-resize.js",
  family: "B",
  command: "toolsresize",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsresize",
  aliases: [],
  category: "restored",
  description: "Restored: tools-resize",
  usage: ".toolsresize",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
