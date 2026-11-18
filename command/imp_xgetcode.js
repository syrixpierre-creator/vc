/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for getcode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "getcode.js",
  family: "A",
  command: "xgetcode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xgetcode",
  aliases: [],
  category: "restored",
  description: "Restored: getcode",
  usage: ".xgetcode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
