/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-toprompt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-toprompt.js",
  family: "A",
  command: "aitoprompt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aitoprompt",
  aliases: [],
  category: "restored",
  description: "Restored: ai-toprompt",
  usage: ".aitoprompt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
