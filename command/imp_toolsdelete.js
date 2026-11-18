/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-delete.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-delete.js",
  family: "A",
  command: "toolsdelete",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsdelete",
  aliases: [],
  category: "restored",
  description: "Restored: tools-delete",
  usage: ".toolsdelete",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
