/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for autoreacts.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "autoreacts.js",
  family: "B",
  command: "autoreacts",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "autoreacts",
  aliases: [],
  category: "restored",
  description: "Restored: autoreacts",
  usage: ".autoreacts",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
