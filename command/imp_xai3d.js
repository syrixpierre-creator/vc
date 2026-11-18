/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-3d.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-3d.js",
  family: "B",
  command: "xai3d",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "xai3d",
  aliases: [],
  category: "restored",
  description: "Restored: ai-3d",
  usage: ".xai3d",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
