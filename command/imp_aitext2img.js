/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-text2img.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-text2img.js",
  family: "B",
  command: "aitext2img",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aitext2img",
  aliases: [],
  category: "restored",
  description: "Restored: ai-text2img",
  usage: ".aitext2img",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
