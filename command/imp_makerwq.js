/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-wq.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-wq.js",
  family: "B",
  command: "makerwq",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerwq",
  aliases: [],
  category: "restored",
  description: "Restored: maker-wq",
  usage: ".makerwq",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
