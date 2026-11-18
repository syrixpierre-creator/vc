/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for npm.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "npm.js",
  family: "B",
  command: "xnpm",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xnpm",
  aliases: [],
  category: "restored",
  description: "Restored: npm",
  usage: ".xnpm",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
