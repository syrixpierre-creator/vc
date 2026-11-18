/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for u-xoat.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "u-xoat.js",
  family: "B",
  command: "uxoat",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "uxoat",
  aliases: [],
  category: "restored",
  description: "Restored: u-xoat",
  usage: ".uxoat",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
