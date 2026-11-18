/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for thunder.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "thunder.js",
  family: "B",
  command: "xthunder",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xthunder",
  aliases: [],
  category: "restored",
  description: "Restored: thunder",
  usage: ".xthunder",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
