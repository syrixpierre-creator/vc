/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for islamicImg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "islamicImg.js",
  family: "A",
  command: "islamicimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "islamicimg",
  aliases: [],
  category: "restored",
  description: "Restored: islamicImg",
  usage: ".islamicimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
