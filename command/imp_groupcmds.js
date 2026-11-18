/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for group-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "group-cmds.js",
  family: "B",
  command: "groupcmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "groupcmds",
  aliases: [],
  category: "restored",
  description: "Restored: group-cmds",
  usage: ".groupcmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
