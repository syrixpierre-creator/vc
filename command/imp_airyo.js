/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-ryo.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-ryo.js",
  family: "B",
  command: "airyo",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "airyo",
  aliases: [],
  category: "restored",
  description: "Restored: ai-ryo",
  usage: ".airyo",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
