/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-upscaler.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-upscaler.js",
  family: "B",
  command: "aiupscaler",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiupscaler",
  aliases: [],
  category: "restored",
  description: "Restored: ai-upscaler",
  usage: ".aiupscaler",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
