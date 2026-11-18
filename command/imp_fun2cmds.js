/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for fun2-cmds.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "fun2-cmds.js",
  family: "B",
  command: "fun2cmds",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "fun2cmds",
  aliases: [],
  category: "restored",
  description: "Restored: fun2-cmds",
  usage: ".fun2cmds",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
