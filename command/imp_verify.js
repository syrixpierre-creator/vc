/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for @verify.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "@verify.js",
  family: "B",
  command: "verify",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "verify",
  aliases: [],
  category: "restored",
  description: "Restored: @verify",
  usage: ".verify",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
