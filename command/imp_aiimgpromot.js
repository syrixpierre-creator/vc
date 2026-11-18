/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-imgpromot.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-imgpromot.js",
  family: "A",
  command: "aiimgpromot",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aiimgpromot",
  aliases: [],
  category: "restored",
  description: "Restored: ai-imgpromot",
  usage: ".aiimgpromot",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
