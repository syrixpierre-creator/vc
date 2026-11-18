/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-powerbrain.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-powerbrain.js",
  family: "A",
  command: "aipowerbrain",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aipowerbrain",
  aliases: [],
  category: "restored",
  description: "Restored: ai-powerbrain",
  usage: ".aipowerbrain",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
