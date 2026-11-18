/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pies.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pies.js",
  family: "A",
  command: "pies",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pies",
  aliases: [],
  category: "restored",
  description: "Restored: pies",
  usage: ".pies",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
