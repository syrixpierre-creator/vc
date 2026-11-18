/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-nik.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-nik.js",
  family: "A",
  command: "toolsnik",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsnik",
  aliases: [],
  category: "restored",
  description: "Restored: tools-nik",
  usage: ".toolsnik",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
