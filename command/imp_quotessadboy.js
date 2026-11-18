/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for quotes-sadboy.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "quotes-sadboy.js",
  family: "A",
  command: "quotessadboy",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "quotessadboy",
  aliases: [],
  category: "restored",
  description: "Restored: quotes-sadboy",
  usage: ".quotessadboy",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
