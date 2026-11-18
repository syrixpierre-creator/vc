/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for searchcode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "searchcode.js",
  family: "A",
  command: "xsearchcode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xsearchcode",
  aliases: [],
  category: "restored",
  description: "Restored: searchcode",
  usage: ".xsearchcode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
