/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for info-runtime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "info-runtime.js",
  family: "B",
  command: "inforuntime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "inforuntime",
  aliases: [],
  category: "restored",
  description: "Restored: info-runtime",
  usage: ".inforuntime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
