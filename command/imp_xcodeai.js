/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for codeai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "codeai.js",
  family: "B",
  command: "xcodeai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xcodeai",
  aliases: [],
  category: "restored",
  description: "Restored: codeai",
  usage: ".xcodeai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
