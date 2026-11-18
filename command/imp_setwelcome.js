/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for setwelcome.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "setwelcome.js",
  family: "B",
  command: "setwelcome",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "setwelcome",
  aliases: [],
  category: "restored",
  description: "Restored: setwelcome",
  usage: ".setwelcome",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
