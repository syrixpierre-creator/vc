/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for islamic-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "islamic-cmds.js",
  family: "B",
  command: "islamiccmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "islamiccmds",
  aliases: [],
  category: "restored",
  description: "Restored: islamic-cmds",
  usage: ".islamiccmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
