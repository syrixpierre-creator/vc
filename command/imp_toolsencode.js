/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-encode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-encode.js",
  family: "B",
  command: "toolsencode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsencode",
  aliases: [],
  category: "restored",
  description: "Restored: tools-encode",
  usage: ".toolsencode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
