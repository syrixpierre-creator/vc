/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-dec.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-dec.js",
  family: "A",
  command: "toolsdec",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsdec",
  aliases: [],
  category: "restored",
  description: "Restored: tools-dec",
  usage: ".toolsdec",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
