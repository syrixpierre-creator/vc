/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for matrix.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "matrix.js",
  family: "B",
  command: "matrix",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "matrix",
  aliases: [],
  category: "restored",
  description: "Restored: matrix",
  usage: ".matrix",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
