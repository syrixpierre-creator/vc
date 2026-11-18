/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for plugins.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "plugins.js",
  family: "B",
  command: "plugins",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "plugins",
  aliases: [],
  category: "restored",
  description: "Restored: plugins",
  usage: ".plugins",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
