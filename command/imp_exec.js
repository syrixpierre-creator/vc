/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for exec.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "exec.js",
  family: "B",
  command: "exec",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "exec",
  aliases: [],
  category: "restored",
  description: "Restored: exec",
  usage: ".exec",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
