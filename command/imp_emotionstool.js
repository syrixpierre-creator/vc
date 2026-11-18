/*****************************************************************************
 * QUEEN AKUMA — Restored wrapper for emotions-tool.js
 *****************************************************************************/
const { run } = require('../lib/compat');

const META = {
  file: "emotions-tool.js",
  family: "B",
  command: "emotionstool",
  perms: { owner: false, group: false, admin: false, botAdmin: false, private: false }
};

module.exports = {
  command: "emotionstool",
  aliases: [],
  category: "restored",
  description: "Restored: emotions-tool",
  usage: ".emotionstool",
  async handler(sock, message, args, context = {}) {
    return run(META, sock, message, args, context);
  }
};
