/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-askai.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-askai.js",
  family: "A",
  command: "aiaskai",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiaskai",
  aliases: [],
  category: "restored",
  description: "Restored: ai-askai",
  usage: ".aiaskai",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
