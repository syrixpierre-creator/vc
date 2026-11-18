/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for tiny.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "tiny.js",
  family: "A",
  command: "tiny",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "tiny",
  aliases: [],
  category: "restored",
  description: "Restored: tiny",
  usage: ".tiny",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
