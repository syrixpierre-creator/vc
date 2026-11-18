/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tools-qrcode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tools-qrcode.js",
  family: "B",
  command: "toolsqrcode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolsqrcode",
  aliases: [],
  category: "restored",
  description: "Restored: tools-qrcode",
  usage: ".toolsqrcode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
