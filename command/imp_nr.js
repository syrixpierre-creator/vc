/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for nr.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "nr.js",
  family: "B",
  command: "nr",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "nr",
  aliases: [],
  category: "restored",
  description: "Restored: nr",
  usage: ".nr",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
