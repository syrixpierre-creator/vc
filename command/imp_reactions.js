/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for reactions.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "reactions.js",
  family: "B",
  command: "reactions",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "reactions",
  aliases: [],
  category: "restored",
  description: "Restored: reactions",
  usage: ".reactions",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
