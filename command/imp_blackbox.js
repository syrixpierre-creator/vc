/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for blackbox.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "blackbox.js",
  family: "A",
  command: "blackbox",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "blackbox",
  aliases: [],
  category: "restored",
  description: "Restored: blackbox",
  usage: ".blackbox",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
