/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for jadian-tolak.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "jadian-tolak.js",
  family: "A",
  command: "jadiantolak",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "jadiantolak",
  aliases: [],
  category: "restored",
  description: "Restored: jadian-tolak",
  usage: ".jadiantolak",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
