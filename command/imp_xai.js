/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai.js",
  family: "A",
  command: "xai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xai",
  aliases: [],
  category: "restored",
  description: "Restored: ai",
  usage: ".xai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
