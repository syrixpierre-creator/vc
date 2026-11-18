/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-sendquoted.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-sendquoted.js",
  family: "B",
  command: "toolssendquoted",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolssendquoted",
  aliases: [],
  category: "restored",
  description: "Restored: tools-sendquoted",
  usage: ".toolssendquoted",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
