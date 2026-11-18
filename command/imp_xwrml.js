/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for wrml.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "wrml.js",
  family: "B",
  command: "xwrml",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xwrml",
  aliases: [],
  category: "restored",
  description: "Restored: wrml",
  usage: ".xwrml",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
