/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-imgprompt.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-imgprompt.js",
  family: "A",
  command: "aiimgprompt",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiimgprompt",
  aliases: [],
  category: "restored",
  description: "Restored: ai-imgprompt",
  usage: ".aiimgprompt",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
