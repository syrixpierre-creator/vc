/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for accept.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "accept.js",
  family: "B",
  command: "xaccept",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xaccept",
  aliases: [],
  category: "restored",
  description: "Restored: accept",
  usage: ".xaccept",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
