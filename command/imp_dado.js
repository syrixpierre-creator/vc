/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for dado.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "dado.js",
  family: "A",
  command: "dado",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "dado",
  aliases: [],
  category: "restored",
  description: "Restored: dado",
  usage: ".dado",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
