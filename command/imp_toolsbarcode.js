/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-barcode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-barcode.js",
  family: "A",
  command: "toolsbarcode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsbarcode",
  aliases: [],
  category: "restored",
  description: "Restored: tools-barcode",
  usage: ".toolsbarcode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
