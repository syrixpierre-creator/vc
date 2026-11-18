/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-hd.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-hd.js",
  family: "A",
  command: "toolshd",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolshd",
  aliases: [],
  category: "restored",
  description: "Restored: tools-hd",
  usage: ".toolshd",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
