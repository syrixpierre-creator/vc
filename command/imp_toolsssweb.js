/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-ssweb.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-ssweb.js",
  family: "A",
  command: "toolsssweb",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsssweb",
  aliases: [],
  category: "restored",
  description: "Restored: tools-ssweb",
  usage: ".toolsssweb",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
