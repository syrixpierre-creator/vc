/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cyberImg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cyberImg.js",
  family: "A",
  command: "cyberimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "cyberimg",
  aliases: [],
  category: "restored",
  description: "Restored: cyberImg",
  usage: ".cyberimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
