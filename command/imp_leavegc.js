/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for leavegc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "leavegc.js",
  family: "A",
  command: "leavegc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "leavegc",
  aliases: [],
  category: "restored",
  description: "Restored: leavegc",
  usage: ".leavegc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
