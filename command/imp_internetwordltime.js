/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for internet-wordltime.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "internet-wordltime.js",
  family: "A",
  command: "internetwordltime",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "internetwordltime",
  aliases: [],
  category: "restored",
  description: "Restored: internet-wordltime",
  usage: ".internetwordltime",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
