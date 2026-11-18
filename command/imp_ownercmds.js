/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for owner-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "owner-cmds.js",
  family: "B",
  command: "ownercmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "ownercmds",
  aliases: [],
  category: "restored",
  description: "Restored: owner-cmds",
  usage: ".ownercmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
