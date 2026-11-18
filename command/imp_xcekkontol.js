/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for cekkontol.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "cekkontol.js",
  family: "A",
  command: "xcekkontol",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xcekkontol",
  aliases: [],
  category: "restored",
  description: "Restored: cekkontol",
  usage: ".xcekkontol",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
