/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for jadian-nembak.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "jadian-nembak.js",
  family: "B",
  command: "jadiannembak",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "jadiannembak",
  aliases: [],
  category: "restored",
  description: "Restored: jadian-nembak",
  usage: ".jadiannembak",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
