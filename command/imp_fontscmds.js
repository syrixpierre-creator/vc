/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fonts-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fonts-cmds.js",
  family: "B",
  command: "fontscmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "fontscmds",
  aliases: [],
  category: "restored",
  description: "Restored: fonts-cmds",
  usage: ".fontscmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
