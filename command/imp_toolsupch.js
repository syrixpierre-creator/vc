/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-upch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-upch.js",
  family: "B",
  command: "toolsupch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsupch",
  aliases: [],
  category: "restored",
  description: "Restored: tools-upch",
  usage: ".toolsupch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
