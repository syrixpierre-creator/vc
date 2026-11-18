/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for Main-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "Main-cmds.js",
  family: "B",
  command: "maincmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "maincmds",
  aliases: [],
  category: "restored",
  description: "Restored: Main-cmds",
  usage: ".maincmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
