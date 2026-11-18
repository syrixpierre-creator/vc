/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for down-instagram.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "down-instagram.js",
  family: "B",
  command: "downinstagram",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "downinstagram",
  aliases: [],
  category: "restored",
  description: "Restored: down-instagram",
  usage: ".downinstagram",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
