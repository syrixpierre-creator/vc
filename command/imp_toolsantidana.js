/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-antidana.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-antidana.js",
  family: "B",
  command: "toolsantidana",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsantidana",
  aliases: [],
  category: "restored",
  description: "Restored: tools-antidana",
  usage: ".toolsantidana",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
