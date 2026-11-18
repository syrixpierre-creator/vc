/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for pinchat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "pinchat.js",
  family: "B",
  command: "pinchat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "pinchat",
  aliases: [],
  category: "restored",
  description: "Restored: pinchat",
  usage: ".pinchat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
