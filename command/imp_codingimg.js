/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for codingImg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "codingImg.js",
  family: "A",
  command: "codingimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "codingimg",
  aliases: [],
  category: "restored",
  description: "Restored: codingImg",
  usage: ".codingimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
