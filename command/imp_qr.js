/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for qr.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "qr.js",
  family: "B",
  command: "qr",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "qr",
  aliases: [],
  category: "restored",
  description: "Restored: qr",
  usage: ".qr",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
