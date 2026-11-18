/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-komikindo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-komikindo.js",
  family: "B",
  command: "internetkomikindo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetkomikindo",
  aliases: [],
  category: "restored",
  description: "Restored: internet-komikindo",
  usage: ".internetkomikindo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
