/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cmd-del.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cmd-del.js",
  family: "B",
  command: "cmddel",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "cmddel",
  aliases: [],
  category: "restored",
  description: "Restored: cmd-del",
  usage: ".cmddel",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
