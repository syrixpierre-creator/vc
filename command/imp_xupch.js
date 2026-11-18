/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for upch.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "upch.js",
  family: "B",
  command: "xupch",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xupch",
  aliases: [],
  category: "restored",
  description: "Restored: upch",
  usage: ".xupch",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
