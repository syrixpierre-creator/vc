/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-delplugin.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-delplugin.js",
  family: "B",
  command: "ownerdelplugin",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownerdelplugin",
  aliases: [],
  category: "restored",
  description: "Restored: owner-delplugin",
  usage: ".ownerdelplugin",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
