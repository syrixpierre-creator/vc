/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for spack.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "spack.js",
  family: "B",
  command: "xspack",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xspack",
  aliases: [],
  category: "restored",
  description: "Restored: spack",
  usage: ".xspack",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
