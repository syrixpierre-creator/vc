/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-hd2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-hd2.js",
  family: "B",
  command: "toolshd2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolshd2",
  aliases: [],
  category: "restored",
  description: "Restored: tools-hd2",
  usage: ".toolshd2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
