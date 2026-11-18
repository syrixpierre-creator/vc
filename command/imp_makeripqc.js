/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-ipqc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-ipqc.js",
  family: "A",
  command: "makeripqc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makeripqc",
  aliases: [],
  category: "restored",
  description: "Restored: maker-ipqc",
  usage: ".makeripqc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
