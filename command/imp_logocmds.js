/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for logo-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "logo-cmds.js",
  family: "B",
  command: "logocmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "logocmds",
  aliases: [],
  category: "restored",
  description: "Restored: logo-cmds",
  usage: ".logocmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
