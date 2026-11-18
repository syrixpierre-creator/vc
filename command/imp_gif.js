/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for gif.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "gif.js",
  family: "A",
  command: "gif",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "gif",
  aliases: [],
  category: "restored",
  description: "Restored: gif",
  usage: ".gif",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
