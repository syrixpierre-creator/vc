/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for delplugin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "delplugin.js",
  family: "A",
  command: "delplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "delplugin",
  aliases: [],
  category: "restored",
  description: "Restored: delplugin",
  usage: ".delplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
