/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tstalk.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tstalk.js",
  family: "A",
  command: "tstalk",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tstalk",
  aliases: [],
  category: "restored",
  description: "Restored: tstalk",
  usage: ".tstalk",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
