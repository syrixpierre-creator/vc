/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-llama.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-llama.js",
  family: "B",
  command: "aillama",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aillama",
  aliases: [],
  category: "restored",
  description: "Restored: ai-llama",
  usage: ".aillama",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
