/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for errorlog.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "errorlog.js",
  family: "A",
  command: "errorlog",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "errorlog",
  aliases: [],
  category: "restored",
  description: "Restored: errorlog",
  usage: ".errorlog",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
