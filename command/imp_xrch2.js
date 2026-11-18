/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for rch2.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "rch2.js",
  family: "A",
  command: "xrch2",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xrch2",
  aliases: [],
  category: "restored",
  description: "Restored: rch2",
  usage: ".xrch2",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
