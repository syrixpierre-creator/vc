/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for getpp.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "getpp.js",
  family: "A",
  command: "xgetpp",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgetpp",
  aliases: [],
  category: "restored",
  description: "Restored: getpp",
  usage: ".xgetpp",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
