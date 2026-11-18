/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for bing.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "bing.js",
  family: "A",
  command: "bing",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "bing",
  aliases: [],
  category: "restored",
  description: "Restored: bing",
  usage: ".bing",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
