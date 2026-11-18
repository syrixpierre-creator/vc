/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-ilmuan.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-ilmuan.js",
  family: "A",
  command: "xquotesilmuan",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xquotesilmuan",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-ilmuan",
  usage: ".xquotesilmuan",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
