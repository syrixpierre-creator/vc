/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-antilinkphising.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-antilinkphising.js",
  family: "B",
  command: "toolsantilinkphising",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsantilinkphising",
  aliases: [],
  category: "restored",
  description: "Restored: tools-antilinkphising",
  usage: ".toolsantilinkphising",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
