/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ss.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ss.js",
  family: "A",
  command: "xss",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xss",
  aliases: [],
  category: "restored",
  description: "Restored: ss",
  usage: ".xss",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
