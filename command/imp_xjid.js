/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for Jid.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "Jid.js",
  family: "B",
  command: "xjid",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xjid",
  aliases: [],
  category: "restored",
  description: "Restored: Jid",
  usage: ".xjid",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
