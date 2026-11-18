/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-komiku.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-komiku.js",
  family: "B",
  command: "internetkomiku",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetkomiku",
  aliases: [],
  category: "restored",
  description: "Restored: internet-komiku",
  usage: ".internetkomiku",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
