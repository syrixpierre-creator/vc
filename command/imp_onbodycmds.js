/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for on-body-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "on-body-cmds.js",
  family: "B",
  command: "onbodycmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "onbodycmds",
  aliases: [],
  category: "restored",
  description: "Restored: on-body-cmds",
  usage: ".onbodycmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
