/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for Fun-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "Fun-cmds.js",
  family: "B",
  command: "funcmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "funcmds",
  aliases: [],
  category: "restored",
  description: "Restored: Fun-cmds",
  usage: ".funcmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
