/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for areact.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "areact.js",
  family: "B",
  command: "areact",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "areact",
  aliases: [],
  category: "restored",
  description: "Restored: areact",
  usage: ".areact",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
