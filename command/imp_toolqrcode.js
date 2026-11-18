/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tool-qrcode.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tool-qrcode.js",
  family: "B",
  command: "toolqrcode",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "toolqrcode",
  aliases: [],
  category: "restored",
  description: "Restored: tool-qrcode",
  usage: ".toolqrcode",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
