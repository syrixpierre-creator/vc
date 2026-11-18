/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for ai-createimg.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "ai-createimg.js",
  family: "B",
  command: "aicreateimg",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "aicreateimg",
  aliases: [],
  category: "restored",
  description: "Restored: ai-createimg",
  usage: ".aicreateimg",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
