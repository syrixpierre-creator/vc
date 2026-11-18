/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for receipts.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "receipts.js",
  family: "B",
  command: "receipts",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "receipts",
  aliases: [],
  category: "restored",
  description: "Restored: receipts",
  usage: ".receipts",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
