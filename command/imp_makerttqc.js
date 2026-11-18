/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for maker-ttqc.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "maker-ttqc.js",
  family: "B",
  command: "makerttqc",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "makerttqc",
  aliases: [],
  category: "restored",
  description: "Restored: maker-ttqc",
  usage: ".makerttqc",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
