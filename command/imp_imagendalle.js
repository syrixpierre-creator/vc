/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for imagen-dalle.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "imagen-dalle.js",
  family: "B",
  command: "imagendalle",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "imagendalle",
  aliases: [],
  category: "restored",
  description: "Restored: imagen-dalle",
  usage: ".imagendalle",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
