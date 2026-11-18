/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for new_matrix.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "new_matrix.js",
  family: "A",
  command: "newmatrix",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "newmatrix",
  aliases: [],
  category: "restored",
  description: "Restored: new_matrix",
  usage: ".newmatrix",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
