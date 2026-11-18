/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for online.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "online.js",
  family: "A",
  command: "xonline",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xonline",
  aliases: [],
  category: "restored",
  description: "Restored: online",
  usage: ".xonline",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
