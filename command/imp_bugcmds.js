/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bug-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bug-cmds.js",
  family: "B",
  command: "bugcmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "bugcmds",
  aliases: [],
  category: "restored",
  description: "Restored: bug-cmds",
  usage: ".bugcmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
