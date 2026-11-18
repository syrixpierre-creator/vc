/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_receipts.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_receipts.js",
  family: "A",
  command: "newreceipts",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newreceipts",
  aliases: [],
  category: "restored",
  description: "Restored: new_receipts",
  usage: ".newreceipts",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
