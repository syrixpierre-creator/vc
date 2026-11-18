/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-hd4.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-hd4.js",
  family: "B",
  command: "toolshd4",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolshd4",
  aliases: [],
  category: "restored",
  description: "Restored: tools-hd4",
  usage: ".toolshd4",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
