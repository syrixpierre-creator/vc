/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for textmaker.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "textmaker.js",
  family: "A",
  command: "textmaker",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "textmaker",
  aliases: [],
  category: "restored",
  description: "Restored: textmaker",
  usage: ".textmaker",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
