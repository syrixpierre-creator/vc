/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-claudeai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-claudeai.js",
  family: "B",
  command: "aiclaudeai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiclaudeai",
  aliases: [],
  category: "restored",
  description: "Restored: ai-claudeai",
  usage: ".aiclaudeai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
