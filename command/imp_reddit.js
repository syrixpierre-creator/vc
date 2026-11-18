/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for reddit.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "reddit.js",
  family: "B",
  command: "reddit",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "reddit",
  aliases: [],
  category: "restored",
  description: "Restored: reddit",
  usage: ".reddit",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
