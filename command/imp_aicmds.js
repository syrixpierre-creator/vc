/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-cmds.js",
  family: "B",
  command: "aicmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aicmds",
  aliases: [],
  category: "restored",
  description: "Restored: ai-cmds",
  usage: ".aicmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
