/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for android1.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "android1.js",
  family: "A",
  command: "android1",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "android1",
  aliases: [],
  category: "restored",
  description: "Restored: android1",
  usage: ".android1",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
