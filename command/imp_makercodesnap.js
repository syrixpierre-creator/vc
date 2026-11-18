/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-codesnap.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-codesnap.js",
  family: "A",
  command: "makercodesnap",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makercodesnap",
  aliases: [],
  category: "restored",
  description: "Restored: maker-codesnap",
  usage: ".makercodesnap",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
